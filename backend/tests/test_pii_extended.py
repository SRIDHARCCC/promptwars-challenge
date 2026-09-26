from app.services.document_parser import mask_sensitive_pii


def test_pii_masking_comprehensive():
    """Verify that Aadhaar, PAN, phone, cards, emails, voter ID, and passport are masked."""
    text = (
        "Citizen details: Email is citizen.justice@example.com. "
        "Voter ID is ABC1234567. Passport number is Z1234567. "
        "Aadhaar is 9876 5432 1098, PAN is ABCDE9876Z, phone is +91 9876543210."
    )
    masked = mask_sensitive_pii(text)

    # Verify sensitive data removed
    assert "citizen.justice@example.com" not in masked
    assert "[REDACTED_EMAIL]" in masked

    assert "ABC1234567" not in masked
    assert "[REDACTED_VOTER_ID]" in masked

    assert "Z1234567" not in masked
    assert "[REDACTED_PASSPORT]" in masked

    assert "9876 5432 1098" not in masked
    assert "[REDACTED_AADHAAR]" in masked

    assert "ABCDE9876Z" not in masked
    assert "[REDACTED_PAN]" in masked

    assert "9876543210" not in masked
    assert "[REDACTED_PHONE]" in masked
