"""Iteration 2 — Post-MVP reconciliation backend tests.

Covers:
- Public site-config defaults
- Public projects/artists/news filters (VERIFIED_* + public/published)
- Public integrations (7 NOT_CONNECTED)
- OS auth (401 without Bearer)
- OS projects PATCH: verification/public gating, bad status 400
- OS site-config PUT
- OS news CRUD + publication gate
- OS artists PATCH
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://factory-ops-51.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

FOUNDER_EMAIL = "anbatolmq@gmail.com"
FOUNDER_PW = "FactoryMaker2026!"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": FOUNDER_EMAIL, "password": FOUNDER_PW}, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# --------------- Public endpoints ---------------
class TestPublic:
    def test_site_config_defaults(self):
        r = requests.get(f"{API}/public/site-config", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d.get("hero_title_line1") == "On construit la culture."
        assert d.get("show_stats_band") is False

    def test_public_projects_empty_by_default(self):
        r = requests.get(f"{API}/public/projects", timeout=15)
        assert r.status_code == 200
        # No verified public projects should exist (test cleans up)
        items = r.json()
        assert isinstance(items, list)
        # cannot assert 0 strictly (previous test data may exist); check schema
        for it in items:
            assert it.get("public") is True
            assert it.get("verification_status") in {"VERIFIED_COMPLETED", "VERIFIED_RELEASED", "VERIFIED_CURRENT"}

    def test_public_artists_schema(self):
        r = requests.get(f"{API}/public/artists", timeout=15)
        assert r.status_code == 200
        for it in r.json():
            assert it.get("public") is True

    def test_public_news_schema(self):
        r = requests.get(f"{API}/public/news", timeout=15)
        assert r.status_code == 200
        for it in r.json():
            assert it.get("published") is True

    def test_public_integrations_7_not_connected(self):
        r = requests.get(f"{API}/public/integrations", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 7
        for i in data:
            assert i["status"] == "NOT_CONNECTED"


# --------------- Auth gates ---------------
class TestAuthGates:
    @pytest.mark.parametrize("path,method", [
        ("/os/projects/xxx", "patch"),
        ("/os/artists/xxx", "patch"),
        ("/os/news/xxx", "patch"),
        ("/os/site-config", "put"),
    ])
    def test_401_without_auth(self, path, method):
        r = requests.request(method, f"{API}{path}", json={}, timeout=15)
        assert r.status_code == 401


# --------------- Projects: publish + verify flow ---------------
class TestProjectsFlow:
    project_id = None

    def test_create_project(self, auth):
        payload = {"name": "TEST_ProjectReconcile", "type": "music", "year": 2025}
        r = requests.post(f"{API}/os/projects", json=payload, headers=auth, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == payload["name"]
        assert d["verification_status"] == "UNVERIFIED"
        assert d["public"] is False
        TestProjectsFlow.project_id = d["id"]

    def test_patch_verified_public(self, auth):
        pid = TestProjectsFlow.project_id
        r = requests.patch(f"{API}/os/projects/{pid}",
                           json={"public": True, "verification_status": "VERIFIED_COMPLETED"},
                           headers=auth, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["public"] is True
        assert d["verification_status"] == "VERIFIED_COMPLETED"

    def test_appears_in_public(self, auth):
        r = requests.get(f"{API}/public/projects", timeout=15)
        assert r.status_code == 200
        ids = [i["id"] for i in r.json()]
        assert TestProjectsFlow.project_id in ids

    def test_patch_bogus_400(self, auth):
        pid = TestProjectsFlow.project_id
        r = requests.patch(f"{API}/os/projects/{pid}",
                           json={"verification_status": "BOGUS"},
                           headers=auth, timeout=15)
        assert r.status_code == 400

    def test_revert_hides_from_public(self, auth):
        pid = TestProjectsFlow.project_id
        r = requests.patch(f"{API}/os/projects/{pid}",
                           json={"public": False, "verification_status": "UNVERIFIED"},
                           headers=auth, timeout=15)
        assert r.status_code == 200
        r2 = requests.get(f"{API}/public/projects", timeout=15)
        ids = [i["id"] for i in r2.json()]
        assert pid not in ids

    def test_cleanup(self, auth):
        pid = TestProjectsFlow.project_id
        r = requests.delete(f"{API}/os/projects/{pid}", headers=auth, timeout=15)
        assert r.status_code == 200


# --------------- Site config ---------------
class TestSiteConfig:
    original_title = None

    def test_get_then_put(self, auth):
        r0 = requests.get(f"{API}/public/site-config", timeout=15)
        TestSiteConfig.original_title = r0.json().get("hero_title_line1")

        r = requests.put(f"{API}/os/site-config",
                         json={"hero_title_line1": "Test Title"},
                         headers=auth, timeout=15)
        assert r.status_code == 200
        assert r.json().get("hero_title_line1") == "Test Title"

        r2 = requests.get(f"{API}/public/site-config", timeout=15)
        assert r2.json().get("hero_title_line1") == "Test Title"

    def test_revert(self, auth):
        r = requests.put(f"{API}/os/site-config",
                         json={"hero_title_line1": TestSiteConfig.original_title or "On construit la culture."},
                         headers=auth, timeout=15)
        assert r.status_code == 200


# --------------- News CRUD ---------------
class TestNewsCRUD:
    news_id = None

    def test_create(self, auth):
        r = requests.post(f"{API}/os/news",
                          json={"title": "TEST_News1", "excerpt": "hello"},
                          headers=auth, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["title"] == "TEST_News1"
        assert d["published"] is False
        TestNewsCRUD.news_id = d["id"]

    def test_publish_and_verify(self, auth):
        nid = TestNewsCRUD.news_id
        r = requests.patch(f"{API}/os/news/{nid}",
                           json={"published": True, "verification_status": "VERIFIED_CURRENT",
                                 "publish_date": "2026-01-15"},
                           headers=auth, timeout=15)
        assert r.status_code == 200
        assert r.json()["published"] is True

    def test_public_shows(self, auth):
        r = requests.get(f"{API}/public/news", timeout=15)
        ids = [i["id"] for i in r.json()]
        assert TestNewsCRUD.news_id in ids

    def test_bad_status_400(self, auth):
        nid = TestNewsCRUD.news_id
        r = requests.patch(f"{API}/os/news/{nid}",
                           json={"verification_status": "NOPE"},
                           headers=auth, timeout=15)
        assert r.status_code == 400

    def test_delete(self, auth):
        nid = TestNewsCRUD.news_id
        r = requests.delete(f"{API}/os/news/{nid}", headers=auth, timeout=15)
        assert r.status_code == 200
        r2 = requests.get(f"{API}/public/news", timeout=15)
        ids = [i["id"] for i in r2.json()]
        assert nid not in ids


# --------------- Artists ---------------
class TestArtists:
    artist_id = None

    def test_create_and_publish(self, auth):
        r = requests.post(f"{API}/os/artists",
                          json={"stage_name": "TEST_Artist"},
                          headers=auth, timeout=15)
        assert r.status_code == 200
        aid = r.json()["id"]
        TestArtists.artist_id = aid

        r2 = requests.patch(f"{API}/os/artists/{aid}",
                            json={"public": True, "verification_status": "VERIFIED_CURRENT",
                                  "avatar_url": "https://picsum.photos/300"},
                            headers=auth, timeout=15)
        assert r2.status_code == 200
        d = r2.json()
        assert d["public"] is True
        assert d["avatar_url"] == "https://picsum.photos/300"

    def test_appears_public(self, auth):
        r = requests.get(f"{API}/public/artists", timeout=15)
        ids = [i["id"] for i in r.json()]
        assert TestArtists.artist_id in ids

    def test_cleanup(self, auth):
        aid = TestArtists.artist_id
        # No delete endpoint for artists; unpublish then remove via mongo not accessible.
        # Just unpublish to remove from public listing.
        r = requests.patch(f"{API}/os/artists/{aid}",
                           json={"public": False, "verification_status": "UNVERIFIED"},
                           headers=auth, timeout=15)
        assert r.status_code == 200
