import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_notice_text_analysis():
    sample_notice = """
    LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT, 1881.
    To: Mr. K. Sharma
    From: Advocate R. Ramanathan, Madras High Court
    Sir, Under instructions from my client, you are hereby called upon to pay the sum of Rs. 2,50,000/-
    within 15 days from receipt of this notice, failing which criminal proceedings will be initiated.
    """
    response = client.post("/api/notice/analyze-text", json={"text": sample_notice})
    assert response.status_code == 200
    data = response.json()
    assert "138" in data["document_type"] or "Notice" in data["document_type"]
    assert data["response_deadline_days"] == 15
    assert len(data["immediate_dos"]) > 0
    assert len(data["immediate_donts"]) > 0


def test_notice_short_text_error():
    response = client.post("/api/notice/analyze-text", json={"text": "hello"})
    assert response.status_code == 400
