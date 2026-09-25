import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Google ADK 2.0" in data["framework"]


def test_triage_tenancy_dispute():
    payload = {
        "narrative": "My landlord in Chennai has kept my 1 lakh security deposit and is not picking up my calls after I vacated.",
        "language": "en",
        "location_state": "Tamil Nadu",
        "role": "tenant"
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Tenancy" in data["category"] or "Housing" in data["category"]
    assert len(data["dos"]) > 0
    assert len(data["donts"]) > 0
    assert "Advocates Act" in data["disclaimer"]


def test_triage_cheque_bounce():
    payload = {
        "narrative": "A client gave me a cheque for 2 lakhs which got bounced due to insufficient funds yesterday.",
        "language": "ta",
        "location_state": "Tamil Nadu"
    }
    response = client.post("/api/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Cheque" in data["category"] or "138" in data["sub_category"]
    assert data["urgency_level"] == "High"
    assert "30" in data["statutory_info"]["limitation_period"]
