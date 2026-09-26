from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_security_headers_present():
    """Verify standard security headers are attached to responses."""
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert "strict-origin" in resp.headers.get("Referrer-Policy", "")


def test_idor_protection_rejects_unauthorized_access():
    """Verify that a user cannot access another citizen's consultation when x-auth-id does not match."""
    # First save a case for user A
    owner_auth_id = "user_alpha_123"
    attacker_auth_id = "user_attacker_999"

    payload = {
        "auth_id": owner_auth_id,
        "client_name": "Alpha Citizen",
        "category": "Tenancy & Housing",
        "narrative": "Confidential landlord harassment dispute",
        "language": "en"
    }

    create_resp = client.post("/api/cases", json=payload)
    assert create_resp.status_code == 200
    case_id = create_resp.json()["id"]

    # Attacker tries to read Alpha's case with their own auth ID header -> 403 Forbidden
    unauthorized_resp = client.get(
        f"/api/cases/{case_id}",
        headers={"x-auth-id": attacker_auth_id}
    )
    assert unauthorized_resp.status_code == 403
    assert "Forbidden" in unauthorized_resp.json()["detail"]

    # Legitimate owner reads the case with matching x-auth-id -> 200 OK
    authorized_resp = client.get(
        f"/api/cases/{case_id}",
        headers={"x-auth-id": owner_auth_id}
    )
    assert authorized_resp.status_code == 200
    assert authorized_resp.json()["id"] == case_id


def test_empty_or_whitespace_auth_id_rejected():
    """Verify validation on empty auth_id parameter."""
    resp = client.get("/api/cases?auth_id=   ")
    assert resp.status_code in (400, 422)
