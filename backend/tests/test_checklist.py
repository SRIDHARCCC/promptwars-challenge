import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_checklist_cheque_bounce():
    payload = {
        "category": "Cheque Bounce & Debt Recovery",
        "narrative": "Cheque dishonoured with insufficient funds",
        "language": "en"
    }
    response = client.post("/api/checklist", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_mandatory"] > 0
    assert len(data["documents"]) >= 3
    # Verify original cheque and bank memo are listed
    names = [d["name"] for d in data["documents"]]
    assert any("Cheque" in n for n in names)
    assert any("Memo" in n for n in names)


def test_checklist_tenancy():
    payload = {
        "category": "Tenancy & Housing",
        "narrative": "Security deposit refund dispute",
        "language": "ta"
    }
    response = client.post("/api/checklist", json=payload)
    assert response.status_code == 200
    data = response.json()
    names = [d["name"] for d in data["documents"]]
    assert any("Agreement" in n for n in names)
