from app.services.document_parser import mask_sensitive_pii


def test_pii_masking():
    sample_text = (
        "Complainant Aadhaar is 5432 9876 1234 and PAN is ABCDE1234F. "
        "Contact phone number is 9876543210 and card is 4111 2222 3333 4444."
    )
    masked = mask_sensitive_pii(sample_text)
    
    assert "5432 9876 1234" not in masked
    assert "[REDACTED_AADHAAR]" in masked
    
    assert "ABCDE1234F" not in masked
    assert "[REDACTED_PAN]" in masked
    
    assert "9876543210" not in masked
    assert "[REDACTED_PHONE]" in masked
    
    assert "4111 2222 3333 4444" not in masked
    assert "[REDACTED_FINANCIAL_CARD]" in masked
