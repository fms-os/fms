# Factory Maker Studio — Product Requirements Document

## Original Problem Statement
Build the Factory Maker Studio ecosystem — a two-product system sharing brand foundation
but with distinct design languages:

- **Product A — Public Website**: cinematic / editorial / cultural / Caribbean-rooted /
  international brand entrance. Answers WHO / WHAT / WHO WITH / WHAT TO BOOK / HOW TO
  START A PROJECT.
- **Product B — FMS OS**: private operating system. Operations, projects, artists, clients,
  bookings, A&R, production, content, releases, distribution, finance, analytics.

The brief mandates a discovery-first / no-fake-data / no-fake-integration philosophy and
explicit boundaries with external CVLN ecosystem entities (FREKCORE, FREKANSLA, KORA,
CVLN Wallet, CVL Brain, Laurentia, Frek-ID) via adapters marked `NOT_CONNECTED`.

## User Choices (from ask_human)
- Deliver both Public site + FMS OS in parallel (Command Center, Projects, Artists,
  Clients, Bookings, A&R).
- Authentication: **local JWT** with a **Frek-ID adapter** boundary (NOT_CONNECTED).
- LLM: **Laurentia adapter** boundary (NOT_CONNECTED) — no third-party LLM integrated now.
- All ecosystem integrations: adapters only, status `NOT_CONNECTED`.
- No demo/fake data. Real content only; real research on Factory Maker Studio used
  (Fort-de-France, Martinique; part of CVLN group; Laurent Coeurvolan + DJ Sayd;
  services: recording, mix/mastering, music video, cinema, artist development).

## User Personas
- **Founder / Admin (Sayd, Laurent)** — needs global command visibility.
- **Producer / A&R / Artist Manager** — daily operations, projects, artists.
- **Client** — books studio, initiates projects, tracks deliverables.
- **Artist** — accesses own artist profile and authorized projects.
- **Visitor (Public)** — discovers FMS, its work, its artists, books a session.

## Architecture Summary
- Backend: FastAPI + MongoDB (motor). Single service with `/api` router.
- Frontend: React 19 + React Router v7 + Tailwind + Shadcn/UI + Framer Motion +
  Recharts.
- Two clearly separated route trees: `/` (public) and `/os/*` (protected).
- Two distinct design systems sharing a brand foundation (logo, wordmark, voice).
- All ecosystem integrations exposed as adapter records (`/api/os/integrations`) with
  explicit `NOT_CONNECTED` status.
- No fake KPIs: financial metrics return `INSUFFICIENT_DATA` while wallet/invoicing are
  NOT_CONNECTED.

## What's Been Implemented (Feb 2026)
- Auth: JWT register/login/me/logout with founder seed (email = user's email).
- Public API: services listing, leads, newsletter, contact, booking request (with
  conflict check).
- OS API: CRUD for projects / artists / clients / bookings / services; command-center
  KPIs (real counts from DB); integrations registry; Laurentia stub.
- Public website: Home (cinematic hero), Services, Realizations, Artists, Studio,
  Actus, Contact, Booking flow, Start-Project flow, Newsletter, About.
- FMS OS: Login, Command Center (KPIs + agenda + projects + alerts + integrations
  panel), Projects, Artists, Clients, Bookings, A&R Pipeline, Leads, Settings /
  Integrations status.

## Post-MVP Reconciliation (Feb 2026 — iter 2)
- Removed all invented public claims from Home (`50+/200+/15+/10+` stats + 4 hardcoded
  realization titles + stock photos labelled as "our studio / our work").
- Added `verification_status` (UNVERIFIED / CONCEPT / PLANNED / IN_PROGRESS /
  VERIFIED_CURRENT / VERIFIED_COMPLETED / VERIFIED_RELEASED) + `public` flags on
  projects, artists; `published` + `verification_status` on news.
- New filtered public endpoints: `/api/public/projects`, `/api/public/artists`,
  `/api/public/news`, `/api/public/site-config` — only VERIFIED_* + public/published.
- New CMS (`/os/cms`) — edits hero, about, studio photo, partners line, footer.
- New Actus module (`/os/news`) — full CRUD + publish/verify gate.
- Row-level publish/verify controls on OS Projects and OS Artists tables.
- All 7 ecosystem adapters enriched with `preview_url`. Status remains
  `NOT_CONNECTED` (integrate — do not recreate).
- Public pages now honest empty states: "Portfolio en construction",
  "Roster en construction", "Photo à venir".
- Test residues purged. DB is clean : 1 founder + 6 real services + 1 site_config.
- Added DELETE /os/artists/{id} and filtered archived from GET /os/projects.

## Prioritized Backlog
### P0 (shipped)
- Auth + role-based session
- Public → Lead capture (Start Project, Contact, Newsletter, Booking Request)
- OS core CRUD (Projects, Artists, Clients, Bookings)
- Command Center (real counts only)
- Integrations adapter registry with NOT_CONNECTED states

### P1 (next)
- Quotes + Invoices + Payments flow (with CVLN Wallet adapter)
- Content pipeline + Campaigns
- Releases + Catalog + Distribution status
- Rights & Royalties
- Audit trail
- Search across entities

### P2
- Frek-ID SSO wire-in
- Laurentia LLM wire-in (grounded assistant)
- CVL Brain analytics ingestion
- KORA release push
- FREKANSLA project bridge
- Public news/CMS pipeline

### P3
- Multi-language (FR/EN/ES)
- Multi-currency / multi-territory
- Advanced analytics dashboards
- Event production module
- Documentary production module

## Ecosystem Boundaries (§146-158)
FMS **owns**: operations, projects, artists, clients, A&R, bookings, commercial, label
ops, content ops.

FMS **references** (via adapters, NOT_CONNECTED):
- Frek-ID → identity
- FREKCORE → provenance / FREK-ID / attestation
- FREKANSLA → audio creation / DAW / .FK
- KORA → streaming / distribution / audience
- CVLN Wallet → wallet / transactions / payouts
- CVL Brain → intelligence / analysis
- Laurentia → reasoning LLM

FMS **must never** recreate these entities.
