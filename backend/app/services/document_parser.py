import re
import io
import logging
from typing import Tuple, Dict, Any
from pypdf import PdfReader

logger = logging.getLogger("satta_thozhan.doc_parser")

# Privacy / PII Regex Masking Patterns
# Match 16-digit cards first before 12-digit Aadhaar
CREDIT_CARD_REGEX = re.compile(r"\b(?:\d{4}[-\s]?){4}\b")
AADHAAR_REGEX = re.compile(r"\b[2-9]\d{3}[-\s]?\d{4}[-\s]?\d{4}\b")
PAN_REGEX = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", re.IGNORECASE)
PHONE_REGEX = re.compile(r"(?:\+91[\-\s]?)?[6-9]\d{9}\b")
EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
VOTER_ID_REGEX = re.compile(r"\b[A-Z]{3}[0-9]{7}\b")
PASSPORT_REGEX = re.compile(r"\b[A-Z][0-9]{7}\b", re.IGNORECASE)


def mask_sensitive_pii(text: str) -> str:
    """
    Masks sensitive personal identification numbers (Aadhaar, PAN, phone numbers,
    card numbers, emails, voter IDs, passports) to protect citizen confidentiality before processing.
    """
    masked = CREDIT_CARD_REGEX.sub("[REDACTED_FINANCIAL_CARD]", text)
    masked = AADHAAR_REGEX.sub("[REDACTED_AADHAAR]", masked)
    masked = PAN_REGEX.sub("[REDACTED_PAN]", masked)
    masked = PHONE_REGEX.sub("[REDACTED_PHONE]", masked)
    masked = EMAIL_REGEX.sub("[REDACTED_EMAIL]", masked)
    masked = VOTER_ID_REGEX.sub("[REDACTED_VOTER_ID]", masked)
    masked = PASSPORT_REGEX.sub("[REDACTED_PASSPORT]", masked)
    return masked


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, Dict[str, Any]]:
    """
    Extracts text and page count safely from uploaded PDF file bytes.
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        total_pages = len(reader.pages)
        extracted_text = []

        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            extracted_text.append(f"--- PAGE {i+1} ---\n{page_text}")

        full_text = "\n".join(extracted_text)
        sanitized_text = mask_sensitive_pii(full_text)
        
        metadata = {
            "page_count": total_pages,
            "char_count": len(full_text),
            "is_encrypted": reader.is_encrypted,
        }
        return sanitized_text, metadata
    except Exception as e:
        logger.error(f"Error parsing PDF: {e}")
        raise ValueError(f"Could not parse PDF document: {str(e)}")
