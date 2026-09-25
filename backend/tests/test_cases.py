from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_save_and_list_cases():
    test_auth_id = "test_auth_user_999"
    payload = {
        "auth_id": test_auth_id,
        "client_name": "Test User",
        "client_email": "test@example.com",
        "category": "Consumer Protection",
        "narrative": "Defective electronic equipment warranty dispute",
        "language": "en",
        "triage_result": {
            "category": "Consumer Protection",
            "urgency_level": "Medium"
        },
        "evidence_checklist": {
            "ready": ["Purchase Invoice"]
        },
        "prep_sheet": {
            "title": "Consumer Protection Brief"
        }
    }

    # Test Save
    response = client.post("/api/cases", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["auth_id"] == test_auth_id
    case_id = data["id"]
    assert case_id is not None

    # Test List
    list_resp = client.get(f"/api/cases?auth_id={test_auth_id}")
    assert list_resp.status_code == 200
    cases = list_resp.json()
    assert len(cases) >= 1
    assert any(c["id"] == case_id for c in cases)

    # Test Get Single Case
    get_resp = client.get(f"/api/cases/{case_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["category"] == "Consumer Protection"
