import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_upload_empty_file():
    """Verify empty document upload returns 400."""
    files = {"file": ("empty.pdf", b"", "application/pdf")}
    resp = client.post("/api/notice/upload", files=files)
    assert resp.status_code == 400
    assert "empty" in resp.json()["detail"].lower()


def test_upload_invalid_file_extension():
    """Verify non-PDF/non-txt files return 400."""
    files = {"file": ("malicious.exe", b"binary content", "application/octet-stream")}
    resp = client.post("/api/notice/upload", files=files)
    assert resp.status_code == 400
    assert "supported" in resp.json()["detail"].lower()


def test_upload_file_exceeding_max_size():
    """Verify files larger than 5MB are rejected with 413 Payload Too Large."""
    # 6MB of dummy bytes
    oversized_bytes = b"0" * (6 * 1024 * 1024)
    files = {"file": ("huge_notice.txt", oversized_bytes, "text/plain")}
    resp = client.post("/api/notice/upload", files=files)
    assert resp.status_code == 413
    assert "exceeds maximum allowed size" in resp.json()["detail"].lower()


def test_upload_fake_pdf_header():
    """Verify that a file claiming to be PDF but lacking %PDF magic bytes is rejected."""
    corrupted_pdf = b"NOT_A_REAL_PDF_HEADER_CONTENT_HERE"
    files = {"file": ("fake_notice.pdf", corrupted_pdf, "application/pdf")}
    resp = client.post("/api/notice/upload", files=files)
    assert resp.status_code == 400
    assert "invalid pdf" in resp.json()["detail"].lower()


def test_upload_valid_txt_notice():
    """Verify valid text notice upload succeeds."""
    valid_text = (
        "LEGAL NOTICE UNDER SECTION 138 OF THE NEGOTIABLE INSTRUMENTS ACT. "
        "Take notice that Cheque No. 123456 for Rs. 50,000 was returned unpaid."
    )
    files = {"file": ("legal_notice.txt", valid_text.encode("utf-8"), "text/plain")}
    resp = client.post("/api/notice/upload", files=files)
    assert resp.status_code == 200
    data = resp.json()
    assert "138" in data["document_type"] or "Notice" in data["document_type"]
    assert len(data["immediate_dos"]) > 0
