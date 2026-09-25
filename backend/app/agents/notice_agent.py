import re
import google.adk as adk
from app.config import settings
from app.schemas.notice import NoticeAnalysisResponse
from app.services.gemini_client import call_gemini_structured

NOTICE_INSTRUCTION = """
You are an expert Indian Legal Notice & Summons Auditor for 'Satta Thozhan'.
Your job is to parse legal notices, demand letters, court summons, or police notices received by citizens.

EXTRACT & HIGHLIGHT:
1. Document Type (e.g. Section 138 NI Act Notice, Defamation Notice, Divorce Notice, Police Summons Sec 179 BNSS).
2. Sender's identity and capacity (Advocate for bank, landlord, employer, court).
3. Statutory or stated response deadline in days (e.g. 7 days, 15 days, 30 days).
4. Monetary claims or demands made.
5. Specific allegations cited.
6. Immediate protective dos and don'ts (Crucial: preserving postal envelope, not admitting liability in writing).
7. Clear guidance on engaging an advocate immediately to reply within the deadline.
"""

notice_adk_agent = adk.Agent(
    name="notice_summons_auditor",
    description="Audits legal notices, extracts deadlines, and highlights risk factors.",
    instruction=NOTICE_INSTRUCTION,
    model=settings.DEFAULT_MODEL,
)


def _generate_mock_notice_analysis(text: str) -> NoticeAnalysisResponse:
    text_lower = text.lower()

    # Rule-based heuristics for demo/fallback
    is_138 = "138" in text_lower or "cheque" in text_lower or "dishonour" in text_lower
    is_court = "summons" in text_lower or "court" in text_lower or "suit" in text_lower
    is_rent = "vacate" in text_lower or "landlord" in text_lower or "tenan" in text_lower

    if is_138:
        doc_type = "Statutory Demand Notice (Section 138 Negotiable Instruments Act)"
        sender = "Advocate on behalf of Complainant / Payee"
        sender_role = "Advocate / Financial Institution"
        deadline_days = 15
        urgency = "Critical"
        claim = "Cheque amount demanded within 15 days"
        statutes = ["Section 138 Negotiable Instruments Act, 1881", "Section 141 (Vicarious Liability)"]
        allegations = [
            "Cheque was issued in discharge of legally enforceable debt/liability.",
            "Cheque returned unpaid with remarks 'Funds Insufficient' / 'Stop Payment'.",
            "Demand for payment within statutory period of 15 days from receipt of notice."
        ]
        dos = [
            "Preserve the registered post envelope with the postal stamp date (starts the 15-day clock).",
            "Immediately consult an advocate to draft a formal legal reply notice within 15 days.",
            "Gather bank statements and proof of any payments or disputes regarding the underlying transaction."
        ]
        donts = [
            "Do NOT ignore this notice; failure to pay or reply within 15 days enables complainant to file a criminal complaint.",
            "Do NOT send an informal handwritten reply or WhatsApp apology admitting liability."
        ]
        action = "Instruct an advocate within 48-72 hours to formulate a reply defending your position or exploring amicable settlement."
    elif is_court:
        doc_type = "Court Summons / Notice of Civil/Criminal Proceeding"
        sender = "Court of Competent Jurisdiction"
        sender_role = "Civil / Magistrate Court"
        deadline_days = 30
        urgency = "Critical"
        claim = "Appearance or filing of Written Statement required"
        statutes = ["Code of Civil Procedure, 1908 (CPC) / BNSS 2023"]
        allegations = ["Notice to appear before the presiding judicial officer on the appointed hearing date."]
        dos = [
            "Check the exact hearing date, court room number, and suit/case number.",
            "Retain an advocate practicing in the designated court to enter appearance (Vakalatnama).",
            "Prepare the Written Statement (WS) within 30 days from summons service date."
        ]
        donts = [
            "Do NOT miss the hearing date; failure to appear will result in an Ex-Parte order or arrest warrant.",
            "Do NOT contact the opposite party's lawyer directly without your own advocate."
        ]
        action = "Engage an advocate practicing in that specific court immediately to inspect court records and file Vakalatnama."
    elif is_rent:
        doc_type = "Notice to Quit / Eviction Notice"
        sender = "Landlord or Counsel for Landlord"
        sender_role = "Landlord"
        deadline_days = 15
        urgency = "High"
        claim = "Vacate premises and handover peaceful possession"
        statutes = ["State Rent Control Act / Transfer of Property Act (Section 106)"]
        allegations = ["Alleged termination of tenancy or default in payment of rent/deposit."]
        dos = [
            "Review the notice period stated in your original tenancy agreement.",
            "Compile all past rent payment receipts and electricity/maintenance bills.",
            "Seek legal assistance to send a rejoinder disputing unlawful claims."
        ]
        donts = [
            "Do NOT stop paying rent or vacating without written terms.",
            "Do NOT allow landlord to cut essential utilities (water/power) — this is illegal under tenancy laws."
        ]
        action = "Consult a civil/tenancy lawyer to verify whether the eviction grounds conform to the applicable State Rent Control Act."
    else:
        doc_type = "Formal Legal Demand Notice"
        sender = "Advocate on behalf of sender"
        sender_role = "Advocate"
        deadline_days = 15
        urgency = "High"
        claim = "Specified in notice body"
        statutes = ["Indian Contract Act, 1872 / Specific Relief Act"]
        allegations = ["Breach of agreement or alleged non-compliance with contractual obligations."]
        dos = [
            "Preserve the physical copy, postal envelope, and tracking number.",
            "Create a point-by-point factual chronology in response to the paragraphs in the notice.",
            "Have an enrolled advocate prepare a formal Legal Reply Notice."
        ]
        donts = [
            "Do NOT reply informally or make verbal admissions over telephone.",
            "Do NOT delay seeking counsel."
        ]
        action = "Arrange a meeting with an advocate within 5 days to issue a legally sound reply."

    return NoticeAnalysisResponse(
        document_type=doc_type,
        sender_name=sender,
        sender_role=sender_role,
        recipient_name="Addressee / Recipient",
        date_of_notice="As per document header",
        response_deadline_days=deadline_days,
        deadline_urgency=urgency,
        monetary_claim=claim,
        key_allegations=allegations,
        relevant_statutes_cited=statutes,
        immediate_dos=dos,
        immediate_donts=donts,
        recommended_advocate_action=action,
        disclaimer=settings.LEGAL_DISCLAIMER
    )


def run_notice_analysis(extracted_text: str) -> NoticeAnalysisResponse:
    prompt = f"""
    Analyze this legal document / notice received by an Indian citizen:
    --- BEGIN DOCUMENT TEXT ---
    {extracted_text[:6000]}
    --- END DOCUMENT TEXT ---

    Extract document type, sender, recipient, date, statutory or stated deadline in days,
    monetary claims, key allegations, relevant Indian statutes, immediate dos and don'ts,
    and recommended advocate action.
    """

    return call_gemini_structured(
        prompt=prompt,
        response_schema=NoticeAnalysisResponse,
        system_instruction=NOTICE_INSTRUCTION,
        mock_fallback_factory=lambda: _generate_mock_notice_analysis(extracted_text)
    )
