import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_prepsheet_compilation():
    payload = {
        "user_name": "Senthil Kumar",
        "case_title": "Withheld Security Deposit of Rs. 1,20,000",
        "category": "Tenancy & Housing",
        "narrative": "Vacated 2BHK flat in T.Nagar on 1st January. Landlord refuses refund despite zero damage.",
        "relief_sought": "Immediate return of 1.2 Lakhs along with interest and advocate charges.",
        "ready_documents": ["Rental Agreement", "Deposit Bank Transfer Slip"],
        "missing_documents": ["Electricity Final Receipt"],
        "language": "en"
    }
    response = client.post("/api/prepsheet", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["client_name"] == "Senthil Kumar"
    assert len(data["top_questions_for_advocate"]) >= 3
    assert data["evidence_readiness_status"]["ready_count"] == 2
    assert data["evidence_readiness_status"]["missing_count"] == 1
    assert "Advocates Act" in data["disclaimer"]
