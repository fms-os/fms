"""
Factory Maker Studio — Unified Backend
Public Website + FMS OS (Operating System)

Architecture rules (§146-158):
- Factory owns: operations, projects, artists, clients, bookings, commercial, label ops.
- External ecosystem entities (FREKCORE, FREKANSLA, KORA, CVLN Wallet, CVL Brain,
  Laurentia, Frek-ID) are prepared as adapters with NOT_CONNECTED status.
"""
from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import bcrypt
import jwt
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, status
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client[db_name]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"

app = FastAPI(title="Factory Maker Studio API", version="1.0.0")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fms")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def new_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def strip_mongo(doc):
    if doc is None:
        return None
    doc.pop("_id", None)
    return doc


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
ROLES = Literal[
    "founder", "admin", "producer", "ar", "artist_manager",
    "engineer", "director", "editor", "creative", "marketing",
    "finance", "client", "artist", "partner",
]

# Verification model (§ post-MVP reconciliation)
VERIFICATION_STATUSES = [
    "VERIFIED_COMPLETED", "VERIFIED_RELEASED", "VERIFIED_CURRENT",
    "IN_PROGRESS", "PLANNED", "CONCEPT", "UNVERIFIED",
]
VERIFIED_PUBLIC = {"VERIFIED_COMPLETED", "VERIFIED_RELEASED", "VERIFIED_CURRENT"}


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    created_at: str
    auth_source: str = "local"  # local | frek_id


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


class RegisterPayload(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "client"


class LeadCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    project_type: Optional[str] = None
    objective: Optional[str] = None
    description: Optional[str] = None
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    location: Optional[str] = None
    source: Optional[str] = "public_website"


class NewsletterSub(BaseModel):
    email: EmailStr
    source: Optional[str] = "public_website"


class ContactPayload(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str


class ProjectCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    type: str = "music"  # music, video, photo, campaign, event, brand, artist_development, release, documentary, other
    client_id: Optional[str] = None
    artist_id: Optional[str] = None
    status: str = "idea"
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    budget: Optional[float] = None
    description: Optional[str] = None
    # Publication & verification (post-MVP reconciliation)
    public: bool = False
    verification_status: str = "UNVERIFIED"
    year: Optional[int] = None
    role: Optional[str] = None  # FMS role on the project (production, mix, video, DA, etc.)
    cover_url: Optional[str] = None
    external_url: Optional[str] = None


class ProjectUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = None
    type: Optional[str] = None
    client_id: Optional[str] = None
    artist_id: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    budget: Optional[float] = None
    description: Optional[str] = None
    public: Optional[bool] = None
    verification_status: Optional[str] = None
    year: Optional[int] = None
    role: Optional[str] = None
    cover_url: Optional[str] = None
    external_url: Optional[str] = None


class ArtistCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    stage_name: str
    genre: Optional[str] = None
    territory: Optional[str] = "Martinique"
    bio: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: str = "discovery"  # discovery, contact, evaluation, development, production, release, growth, international
    ar_stage: Optional[str] = "discovery"
    public: bool = False
    verification_status: str = "UNVERIFIED"
    avatar_url: Optional[str] = None
    spotify_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None


class ArtistUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    stage_name: Optional[str] = None
    genre: Optional[str] = None
    territory: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    public: Optional[bool] = None
    verification_status: Optional[str] = None
    avatar_url: Optional[str] = None
    spotify_url: Optional[str] = None
    instagram_url: Optional[str] = None
    youtube_url: Optional[str] = None


class ClientCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    type: Optional[str] = "individual"
    status: str = "lead"  # lead, qualified, prospect, client, repeat_client, vip


class BookingCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    service_id: Optional[str] = None
    service_name: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[EmailStr] = None
    project_id: Optional[str] = None
    date: str  # ISO date
    start_time: str  # HH:MM
    end_time: str
    location: Optional[str] = None
    notes: Optional[str] = None
    price: Optional[float] = None


class ServiceCreate(BaseModel):
    name: str
    description: str
    category: str
    duration_hours: Optional[float] = None
    price: Optional[float] = None
    currency: str = "EUR"
    location: Optional[str] = None
    active: bool = True
    visible: bool = True


class NewsCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str
    excerpt: Optional[str] = None
    body: Optional[str] = None
    cover_url: Optional[str] = None
    published: bool = False
    verification_status: str = "UNVERIFIED"
    publish_date: Optional[str] = None


class NewsUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: Optional[str] = None
    excerpt: Optional[str] = None
    body: Optional[str] = None
    cover_url: Optional[str] = None
    published: Optional[bool] = None
    verification_status: Optional[str] = None
    publish_date: Optional[str] = None


class SiteConfigUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    hero_eyebrow: Optional[str] = None
    hero_title_line1: Optional[str] = None
    hero_title_line2: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image_url: Optional[str] = None
    about_headline: Optional[str] = None
    about_body: Optional[str] = None
    partners_line: Optional[str] = None
    studio_photo_url: Optional[str] = None
    studio_photo_caption: Optional[str] = None
    footer_tagline: Optional[str] = None
    show_stats_band: Optional[bool] = None  # off by default post-reconciliation


class IntegrationConfigUpdate(BaseModel):
    """Config for a CVLN ecosystem adapter (per-integration). FMS = client of CVLN Gateway."""
    model_config = ConfigDict(extra="ignore")
    base_url: Optional[str] = None       # e.g., https://culture-chain.preview.emergentagent.com or the future central Gateway
    api_key: Optional[str] = None        # stored server-side, never returned in plain
    entity_id: Optional[str] = None      # our identifier inside CVLN (ex: "labelos", "factory_maker_studio")
    auth_type: Optional[str] = None      # "api_key" | "bearer" | "mtls" | "none"
    notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Startup — indexes + admin seed + services seed
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.leads.create_index("email")
    await db.bookings.create_index([("date", 1), ("start_time", 1)])
    await db.newsletter.create_index("email", unique=True)
    await db.news.create_index("publish_date")

    # Seed default site_config only if missing
    if not await db.site_config.find_one({"id": "default"}):
        await db.site_config.insert_one({
            "id": "default",
            "hero_eyebrow": "Factory Maker Studio · Martinique",
            "hero_title_line1": "On construit la culture.",
            "hero_title_line2": "On construit l'héritage.",
            "hero_subtitle": "Studio de production musicale & audiovisuelle. Image cinéma, vision internationale. Ancré dans la Caraïbe, connecté au monde.",
            "hero_image_url": "https://images.unsplash.com/photo-1590201935557-4ede3174758f?crop=entropy&cs=srgb&fm=jpg&q=85&w=2400",
            "about_headline": "Une maison créative caribéenne, internationale.",
            "about_body": "Factory Maker Studio est né à Fort-de-France, en Martinique. Créé en 2022, le studio fait partie de l'écosystème CVLN — un groupe pensé pour structurer, protéger et faire rayonner les artistes et créateurs de la Caraïbe et de sa diaspora.\n\nNous produisons de la musique, des clips, des films, des documentaires, des campagnes. Nous accompagnons des artistes. Nous formons. Nous exportons.",
            "partners_line": "",
            "studio_photo_url": "",
            "studio_photo_caption": "",
            "footer_tagline": "On construit la culture.",
            "show_stats_band": False,
            "created_at": now_iso(),
        })

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@factorymakerstudio.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "changeme")
    admin_name = os.environ.get("ADMIN_NAME", "Founder")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": new_id(),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": admin_name,
            "role": "founder",
            "auth_source": "local",
            "created_at": now_iso(),
        })
        logger.info(f"Seeded founder account: {admin_email}")
    else:
        # keep password in sync with .env
        if not verify_password(admin_password, existing.get("password_hash", "")):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password), "role": "founder"}},
            )

    # Seed default public services (real FMS offering) only if collection is empty
    if await db.services.count_documents({}) == 0:
        defaults = [
            {"name": "Session Studio d'Enregistrement", "category": "music",
             "description": "Enregistrement voix / instruments dans le Studio A. Ingénieur inclus.",
             "duration_hours": 4, "price": 280, "currency": "EUR", "location": "Fort-de-France"},
            {"name": "Mix & Mastering", "category": "music",
             "description": "Mixage et mastering aux standards internationaux (streaming / broadcast).",
             "duration_hours": None, "price": 450, "currency": "EUR", "location": "Remote / Studio"},
            {"name": "Clip Vidéo — Production Complète", "category": "audiovisuel",
             "description": "Direction artistique, tournage, montage, étalonnage.",
             "duration_hours": None, "price": 4500, "currency": "EUR", "location": "Martinique + travel"},
            {"name": "Court Métrage / Documentaire", "category": "audiovisuel",
             "description": "Écriture, production, tournage, post-production.",
             "duration_hours": None, "price": None, "currency": "EUR", "location": "Sur devis"},
            {"name": "Direction Artistique Événement", "category": "evenement",
             "description": "Concept, production exécutive, direction artistique de concert / festival.",
             "duration_hours": None, "price": None, "currency": "EUR", "location": "Sur devis"},
            {"name": "A&R & Développement Artiste", "category": "ar",
             "description": "Accompagnement stratégique, direction artistique, plan de carrière.",
             "duration_hours": None, "price": None, "currency": "EUR", "location": "Programme annuel"},
        ]
        for s in defaults:
            await db.services.insert_one({
                "id": new_id(), "active": True, "visible": True,
                "created_at": now_iso(), **s,
            })

    # Ensure test_credentials.md is up to date
    try:
        creds_path = Path("/app/memory/test_credentials.md")
        creds_path.parent.mkdir(parents=True, exist_ok=True)
        creds_path.write_text(
            f"# Factory Maker Studio — Test Credentials\n\n"
            f"## Founder / Admin\n"
            f"- Email: `{admin_email}`\n"
            f"- Password: `{admin_password}`\n"
            f"- Role: `founder`\n\n"
            f"## Auth endpoints\n"
            f"- POST /api/auth/login\n"
            f"- POST /api/auth/register\n"
            f"- GET  /api/auth/me\n"
            f"- POST /api/auth/logout\n"
        )
    except Exception as e:
        logger.warning(f"Could not write test_credentials.md: {e}")


@app.on_event("shutdown")
async def shutdown():
    mongo_client.close()


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
@api.post("/auth/register")
async def register(payload: RegisterPayload, response: Response):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = new_id()
    doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "role": payload.role if payload.role in [
            "founder", "admin", "producer", "ar", "artist_manager", "engineer",
            "director", "editor", "creative", "marketing", "finance",
            "client", "artist", "partner"] else "client",
        "auth_source": "local",
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(user_id, email, doc["role"])
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="none", max_age=43200, path="/")
    doc.pop("password_hash")
    strip_mongo(doc)
    return {"user": doc, "token": token}


@api.post("/auth/login")
async def login(payload: LoginPayload, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user["id"], user["email"], user["role"])
    response.set_cookie("access_token", token, httponly=True, secure=True, samesite="none", max_age=43200, path="/")
    user.pop("password_hash", None)
    strip_mongo(user)
    return {"user": user, "token": token}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# ---------------------------------------------------------------------------
# Public endpoints (no auth)
# ---------------------------------------------------------------------------
@api.get("/")
async def root():
    return {
        "name": "Factory Maker Studio API",
        "version": "1.0.0",
        "location": "Fort-de-France, Martinique",
        "ecosystem": "CVLN",
    }


@api.get("/public/services")
async def list_public_services():
    docs = await db.services.find({"visible": True, "active": True}, {"_id": 0}).to_list(200)
    return docs


@api.post("/public/leads")
async def create_lead(payload: LeadCreate):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["status"] = "new"
    doc["created_at"] = now_iso()
    await db.leads.insert_one(doc)
    strip_mongo(doc)
    return doc


@api.post("/public/newsletter")
async def newsletter_subscribe(payload: NewsletterSub):
    email = payload.email.lower()
    existing = await db.newsletter.find_one({"email": email})
    if existing:
        return {"ok": True, "already_subscribed": True}
    await db.newsletter.insert_one({
        "id": new_id(), "email": email, "source": payload.source, "created_at": now_iso(),
    })
    return {"ok": True}


@api.post("/public/contact")
async def contact(payload: ContactPayload):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    doc["status"] = "new"
    await db.contacts.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api.post("/public/bookings/request")
async def public_booking_request(payload: BookingCreate):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["status"] = "requested"
    doc["payment_status"] = "unpaid"
    doc["created_at"] = now_iso()
    # Conflict check on same room/service+date+time overlap (naive)
    conflict = await db.bookings.find_one({
        "date": doc["date"],
        "service_name": doc["service_name"],
        "status": {"$in": ["confirmed", "in_progress"]},
        "start_time": {"$lt": doc["end_time"]},
        "end_time": {"$gt": doc["start_time"]},
    })
    if conflict:
        raise HTTPException(status_code=409, detail="Créneau déjà réservé")
    await db.bookings.insert_one(doc)
    strip_mongo(doc)
    return doc


# ---------------------------------------------------------------------------
# Public — FILTERED endpoints (only VERIFIED_* + public=True)
# ---------------------------------------------------------------------------
@api.get("/public/projects")
async def public_projects():
    cursor = db.projects.find(
        {"public": True, "verification_status": {"$in": list(VERIFIED_PUBLIC)}, "archived": {"$ne": True}},
        {"_id": 0}
    ).sort("year", -1)
    return await cursor.to_list(200)


@api.get("/public/artists")
async def public_artists():
    cursor = db.artists.find(
        {"public": True, "verification_status": {"$in": list(VERIFIED_PUBLIC)}},
        {"_id": 0}
    ).sort("stage_name", 1)
    return await cursor.to_list(200)


@api.get("/public/news")
async def public_news():
    cursor = db.news.find(
        {"published": True, "verification_status": {"$in": list(VERIFIED_PUBLIC)}},
        {"_id": 0}
    ).sort("publish_date", -1)
    return await cursor.to_list(200)


@api.get("/public/site-config")
async def public_site_config():
    doc = await db.site_config.find_one({"id": "default"}, {"_id": 0})
    return doc or {}


# ---------------------------------------------------------------------------
# OS — protected CRUD
# ---------------------------------------------------------------------------
async def _list(collection, limit=500):
    return await collection.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)


@api.get("/os/projects")
async def list_projects(user=Depends(get_current_user)):
    return await db.projects.find({"archived": {"$ne": True}}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.post("/os/projects")
async def create_project(payload: ProjectCreate, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    doc["owner_id"] = user["id"]
    await db.projects.insert_one(doc)
    strip_mongo(doc)
    return doc


@api.delete("/os/projects/{project_id}")
async def delete_project(project_id: str, user=Depends(get_current_user)):
    await db.projects.update_one({"id": project_id}, {"$set": {"archived": True, "archived_at": now_iso()}})
    return {"ok": True}


@api.patch("/os/projects/{project_id}")
async def update_project(project_id: str, payload: ProjectUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "verification_status" in updates and updates["verification_status"] not in VERIFICATION_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid verification_status")
    updates["updated_at"] = now_iso()
    r = await db.projects.update_one({"id": project_id}, {"$set": updates})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return doc


@api.get("/os/artists")
async def list_artists(user=Depends(get_current_user)):
    return await _list(db.artists)


@api.post("/os/artists")
async def create_artist(payload: ArtistCreate, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    await db.artists.insert_one(doc)
    strip_mongo(doc)
    return doc


@api.patch("/os/artists/{artist_id}")
async def update_artist(artist_id: str, payload: ArtistUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "verification_status" in updates and updates["verification_status"] not in VERIFICATION_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid verification_status")
    updates["updated_at"] = now_iso()
    r = await db.artists.update_one({"id": artist_id}, {"$set": updates})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artist not found")
    doc = await db.artists.find_one({"id": artist_id}, {"_id": 0})
    return doc


@api.delete("/os/artists/{artist_id}")
async def delete_artist(artist_id: str, user=Depends(get_current_user)):
    await db.artists.delete_one({"id": artist_id})
    return {"ok": True}


@api.get("/os/clients")
async def list_clients(user=Depends(get_current_user)):
    return await _list(db.clients)


@api.post("/os/clients")
async def create_client(payload: ClientCreate, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    await db.clients.insert_one(doc)
    strip_mongo(doc)
    return doc


@api.get("/os/leads")
async def list_leads(user=Depends(get_current_user)):
    return await _list(db.leads)


@api.get("/os/bookings")
async def list_bookings(user=Depends(get_current_user)):
    return await _list(db.bookings)


@api.post("/os/bookings")
async def create_booking(payload: BookingCreate, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["status"] = "confirmed"
    doc["payment_status"] = "unpaid"
    doc["created_at"] = now_iso()
    await db.bookings.insert_one(doc)
    strip_mongo(doc)
    return doc


@api.patch("/os/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, body: dict, user=Depends(get_current_user)):
    new_status = body.get("status")
    if new_status not in ["requested", "pending", "confirmed", "in_progress", "completed", "cancelled", "rescheduled", "no_show"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": new_status, "updated_at": now_iso()}})
    return {"ok": True}


@api.get("/os/services")
async def list_all_services(user=Depends(get_current_user)):
    return await _list(db.services)


@api.post("/os/services")
async def create_service(payload: ServiceCreate, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    await db.services.insert_one(doc)
    strip_mongo(doc)
    return doc


# ---------------------------------------------------------------------------
# News (Actus) — CRUD + publication gate
# ---------------------------------------------------------------------------
@api.get("/os/news")
async def list_news(user=Depends(get_current_user)):
    return await _list(db.news)


@api.post("/os/news")
async def create_news(payload: NewsCreate, user=Depends(get_current_user)):
    doc = payload.model_dump()
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    doc["author_id"] = user["id"]
    if doc.get("verification_status") not in VERIFICATION_STATUSES:
        doc["verification_status"] = "UNVERIFIED"
    await db.news.insert_one(doc)
    strip_mongo(doc)
    return doc


@api.patch("/os/news/{news_id}")
async def update_news(news_id: str, payload: NewsUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "verification_status" in updates and updates["verification_status"] not in VERIFICATION_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid verification_status")
    updates["updated_at"] = now_iso()
    r = await db.news.update_one({"id": news_id}, {"$set": updates})
    if r.matched_count == 0:
        raise HTTPException(status_code=404, detail="News not found")
    doc = await db.news.find_one({"id": news_id}, {"_id": 0})
    return doc


@api.delete("/os/news/{news_id}")
async def delete_news(news_id: str, user=Depends(get_current_user)):
    await db.news.delete_one({"id": news_id})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Site Config — editable content of the public website
# ---------------------------------------------------------------------------
@api.get("/os/site-config")
async def get_site_config(user=Depends(get_current_user)):
    doc = await db.site_config.find_one({"id": "default"}, {"_id": 0})
    return doc or {"id": "default"}


@api.put("/os/site-config")
async def update_site_config(payload: SiteConfigUpdate, user=Depends(get_current_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updates["updated_at"] = now_iso()
    updates["updated_by"] = user["id"]
    await db.site_config.update_one(
        {"id": "default"},
        {"$set": updates, "$setOnInsert": {"id": "default", "created_at": now_iso()}},
        upsert=True,
    )
    doc = await db.site_config.find_one({"id": "default"}, {"_id": 0})
    return doc


# ---------------------------------------------------------------------------
# Command Center — aggregate KPIs
# ---------------------------------------------------------------------------
@api.get("/os/command-center")
async def command_center(user=Depends(get_current_user)):
    projects_active = await db.projects.count_documents({"archived": {"$ne": True}, "status": {"$nin": ["archived", "delivery", "final"]}})
    projects_total = await db.projects.count_documents({"archived": {"$ne": True}})
    artists_total = await db.artists.count_documents({})
    artists_dev = await db.artists.count_documents({"status": {"$in": ["development", "production"]}})
    clients_total = await db.clients.count_documents({})
    leads_new = await db.leads.count_documents({"status": "new"})
    bookings_upcoming = await db.bookings.count_documents({
        "date": {"$gte": datetime.now(timezone.utc).date().isoformat()},
        "status": {"$in": ["requested", "pending", "confirmed"]},
    })

    return {
        "generated_at": now_iso(),
        "kpis": {
            "revenue_mtd": {"value": None, "source": "INSUFFICIENT_DATA", "formula": "Σ paid invoices for current month"},
            "projects_active": {"value": projects_active, "source": "db.projects", "formula": "count active"},
            "bookings_upcoming": {"value": bookings_upcoming, "source": "db.bookings", "formula": "count date>=today AND status in {requested,pending,confirmed}"},
            "artists_in_development": {"value": artists_dev, "source": "db.artists", "formula": "count status in {development,production}"},
            "leads_new": {"value": leads_new, "source": "db.leads", "formula": "count status=new"},
            "clients_total": {"value": clients_total, "source": "db.clients"},
            "projects_total": {"value": projects_total, "source": "db.projects"},
            "artists_total": {"value": artists_total, "source": "db.artists"},
        },
        "notes": "Financial metrics require connected wallet/invoicing. Currently NOT_CONNECTED — reported as INSUFFICIENT_DATA.",
    }


# ---------------------------------------------------------------------------
# Integrations — ecosystem adapters (§146-158)
# ---------------------------------------------------------------------------
ECOSYSTEM_INTEGRATIONS = [
    {
        "key": "frek_id", "label": "Frek-ID",
        "category": "identity", "owner": "CVLN / FREKCORE",
        "responsibility": "Identity provider — future SSO for FMS OS.",
        "factory_responsibility": "Store external Frek-ID reference on user records.",
        "status": "NOT_CONNECTED",
        "preview_url": "https://culture-chain.preview.emergentagent.com/",
    },
    {
        "key": "frekcore", "label": "FREKCORE",
        "category": "provenance", "owner": "CVLN",
        "responsibility": "Identity, provenance, attestation, cultural trace (FREK-ID, FREK-Chain).",
        "factory_responsibility": "Send project/work/creator/asset references. Store external IDs only.",
        "status": "NOT_CONNECTED",
        "preview_url": "https://culture-chain.preview.emergentagent.com/",
    },
    {
        "key": "freakansla", "label": "FREKANSLA",
        "category": "creation", "owner": "CVLN",
        "responsibility": "Audio creation environment (DAW, plugins, .FK format).",
        "factory_responsibility": "Send project + audio references. Never duplicate DAW logic.",
        "status": "NOT_CONNECTED",
        "preview_url": "https://frekcore-certify.preview.emergentagent.com/",
    },
    {
        "key": "kora", "label": "KORA",
        "category": "distribution", "owner": "CVLN",
        "responsibility": "Streaming / cultural distribution / audience layer.",
        "factory_responsibility": "Push releases; consume streaming metrics.",
        "status": "NOT_CONNECTED",
        "preview_url": "https://orbit-connect-15.preview.emergentagent.com/",
    },
    {
        "key": "cvln_wallet", "label": "CVLN Wallet",
        "category": "finance", "owner": "CVLN",
        "responsibility": "Wallet, transactions, balances, payouts.",
        "factory_responsibility": "Send payment/payout requests. Never store card data.",
        "status": "NOT_CONNECTED",
        "preview_url": "https://revolut-style-wallet.preview.emergentagent.com/",
    },
    {
        "key": "cvl_brain", "label": "CVL Brain",
        "category": "intelligence", "owner": "CVLN",
        "responsibility": "Intelligence, analysis, orchestration.",
        "factory_responsibility": "Send structured operational data. Consume recommendations.",
        "status": "NOT_CONNECTED",
        "preview_url": "https://agent-factory-68.preview.emergentagent.com/",
    },
    {
        "key": "laurentia", "label": "Laurentia (LLM)",
        "category": "intelligence", "owner": "CVLN",
        "responsibility": "Reasoning / LLM layer.",
        "factory_responsibility": "Send structured context via API. Consume answers.",
        "status": "NOT_CONNECTED",
        "preview_url": "https://emergent-ai-238.preview.emergentagent.com/",
    },
]


@api.get("/os/integrations")
async def list_integrations(user=Depends(get_current_user)):
    # Merge base defs with stored configs (base_url, entity_id, last test, api_key mask)
    configs = {}
    async for c in db.integration_configs.find({}, {"_id": 0}):
        configs[c["key"]] = c
    result = []
    for base in ECOSYSTEM_INTEGRATIONS:
        cfg = configs.get(base["key"], {})
        merged = {**base}
        merged["base_url"] = cfg.get("base_url", "")
        merged["entity_id"] = cfg.get("entity_id", "")
        merged["auth_type"] = cfg.get("auth_type", "api_key")
        merged["notes"] = cfg.get("notes", "")
        merged["has_api_key"] = bool(cfg.get("api_key"))
        merged["last_test"] = cfg.get("last_test")
        last = cfg.get("last_test") or {}
        if last.get("ok") is True:
            merged["status"] = "CONNECTED"
        elif last.get("ok") is False:
            merged["status"] = "ERROR"
        result.append(merged)
    return result


@api.patch("/os/integrations/{key}")
async def update_integration_config(key: str, payload: IntegrationConfigUpdate, user=Depends(get_current_user)):
    if key not in {i["key"] for i in ECOSYSTEM_INTEGRATIONS}:
        raise HTTPException(status_code=404, detail="Unknown integration key")
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updates["updated_at"] = now_iso()
    updates["updated_by"] = user["id"]
    await db.integration_configs.update_one(
        {"key": key},
        {"$set": updates, "$setOnInsert": {"key": key, "created_at": now_iso()}},
        upsert=True,
    )
    await db.audit_log.insert_one({
        "id": new_id(), "actor_id": user["id"], "actor_email": user["email"],
        "action": "integration.config.update", "entity": "integration", "entity_id": key,
        "before": None, "after": {k: ("***" if k == "api_key" else v) for k, v in updates.items()},
        "timestamp": now_iso(), "source": "os",
    })
    doc = await db.integration_configs.find_one({"key": key}, {"_id": 0, "api_key": 0})
    return doc


@api.post("/os/integrations/{key}/test")
async def test_integration(key: str, user=Depends(get_current_user)):
    if key not in {i["key"] for i in ECOSYSTEM_INTEGRATIONS}:
        raise HTTPException(status_code=404, detail="Unknown integration key")
    cfg = await db.integration_configs.find_one({"key": key}, {"_id": 0})
    if not cfg or not cfg.get("base_url"):
        raise HTTPException(status_code=400, detail="base_url not configured")
    base_url = cfg["base_url"].rstrip("/")
    api_key = cfg.get("api_key")
    auth_type = cfg.get("auth_type", "api_key")

    import urllib.request
    import urllib.error
    import asyncio

    def do_request():
        headers = {"User-Agent": "FMS-CVLN-Client/1.0"}
        if api_key:
            if auth_type == "bearer":
                headers["Authorization"] = f"Bearer {api_key}"
            else:
                headers["X-API-Key"] = api_key
        req = urllib.request.Request(base_url + "/", headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=8) as r:
                return {"ok": True, "status_code": r.status, "reachable": True, "checked_url": base_url + "/"}
        except urllib.error.HTTPError as e:
            return {"ok": e.code < 500, "status_code": e.code, "reachable": True, "checked_url": base_url + "/", "note": e.reason}
        except Exception as e:
            return {"ok": False, "reachable": False, "checked_url": base_url + "/", "error": str(e)}

    result = await asyncio.to_thread(do_request)
    result["tested_at"] = now_iso()
    result["tested_by"] = user["id"]
    await db.integration_configs.update_one(
        {"key": key},
        {"$set": {"last_test": result, "updated_at": now_iso()}},
    )
    await db.audit_log.insert_one({
        "id": new_id(), "actor_id": user["id"], "actor_email": user["email"],
        "action": "integration.test", "entity": "integration", "entity_id": key,
        "before": None, "after": {"ok": result["ok"], "status_code": result.get("status_code")},
        "timestamp": now_iso(), "source": "os",
    })
    return result


@api.get("/os/audit-log")
async def audit_log(limit: int = 100, user=Depends(get_current_user)):
    return await db.audit_log.find({}, {"_id": 0}).sort("timestamp", -1).to_list(min(limit, 500))


@api.get("/public/integrations")
async def list_integrations_public():
    return [{"key": i["key"], "label": i["label"], "status": i["status"]} for i in ECOSYSTEM_INTEGRATIONS]


@api.post("/os/ai/ask")
async def ai_ask(body: dict, user=Depends(get_current_user)):
    """Laurentia adapter — NOT_CONNECTED, returns explicit non-fabricated response."""
    return {
        "adapter": "laurentia",
        "status": "NOT_CONNECTED",
        "answer": "INSUFFICIENT_DATA — Laurentia LLM is not yet connected. Once the adapter is wired, this endpoint will return grounded, source-cited answers.",
        "sources": [],
        "received_prompt": body.get("prompt"),
    }


# ---------------------------------------------------------------------------
# Register router + CORS
# ---------------------------------------------------------------------------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

