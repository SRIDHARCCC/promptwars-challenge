import google.adk as adk
from typing import List
from app.config import settings
from app.schemas.checklist import ChecklistRequest, ChecklistResponse, DocumentItem
from app.services.gemini_client import call_gemini_structured

CHECKLIST_INSTRUCTION = """
You are the Evidence & Document Navigator for 'Satta Thozhan'.
Your objective is to generate an exhaustive, legally grounded checklist of documents that an Indian citizen must bring before visiting an advocate.

RULES:
- Distinguish strictly between:
  * Mandatory Documents (Non-negotiable for filing/admission under Indian procedural codes)
  * Supportive Documents (Corroborative proof that strengthens the claim)
- Tag each item with its evidentiary nature under the Bharatiya Sakshya Adhiniyam, 2023 (BSA) (Primary or Secondary Evidence).
- Provide guidance on where and how to obtain duplicates if the original is missing.
- Include essential evidentiary preservation rules (e.g., Section 63 BSA Certificate for electronic evidence like WhatsApp chats, emails, CDRs).
"""

evidence_adk_agent = adk.Agent(
    name="evidence_checklist_generator",
    description="Generates mandatory and supportive evidence checklists under Indian law.",
    instruction=CHECKLIST_INSTRUCTION,
    model=settings.DEFAULT_MODEL,
)


def _generate_mock_checklist(req: ChecklistRequest) -> ChecklistResponse:
    cat = req.category.lower()

    golden_rules = [
        "Section 63 BSA Certificate: Any digital records (WhatsApp chats, emails, bank PDF statements) must be accompanied by a self-declaration certificate under Section 63 of Bharatiya Sakshya Adhiniyam, 2023.",
        "Preserve Originals: Keep originals in a secure waterproof folder; always provide clean photocopies to your advocate for initial filing.",
        "Postal Envelopes: Never discard registered post envelopes; the postal stamp date serves as conclusive proof of service.",
        "Chronological Order: Arrange documents in ascending order of dates with a cover index."
    ]

    docs: List[DocumentItem] = []

    if "cheque" in cat or "138" in cat or "debt" in cat:
        docs = [
            DocumentItem(
                id="cheque_original",
                name="Original Bounced Cheque",
                name_tamil="அசல் பவுன்ஸ் ஆன காசோலை",
                is_mandatory=True,
                category="Financial",
                purpose="Primary evidence of negotiable instrument required for filing under Section 138 NI Act.",
                how_to_obtain="Obtain directly from your bank branch where the cheque was presented.",
                evidentiary_value="Primary Evidence"
            ),
            DocumentItem(
                id="bank_memo",
                name="Original Bank Return Memo with reason for dishonour",
                name_tamil="வங்கி திரும்பிய மெமோ (Return Memo)",
                is_mandatory=True,
                category="Financial",
                purpose="Proves the date of dishonour and specific reason (e.g. 'Funds Insufficient', 'Stop Payment'). Starts the 30-day statutory clock.",
                how_to_obtain="Issued by your bank alongside the returned cheque.",
                evidentiary_value="Primary Evidence"
            ),
            DocumentItem(
                id="legal_demand_notice",
                name="Copy of Statutory Demand Notice sent to Drawer",
                name_tamil="சட்டப்பூர்வ டிமாண்ட் நோட்டீஸ் நகல்",
                is_mandatory=True,
                category="Official/Court",
                purpose="Mandatory pre-condition under Section 138(b) NI Act demanding payment within 15 days.",
                how_to_obtain="Retain office copy signed by you or your sending advocate.",
                evidentiary_value="Primary / Admissible Copy"
            ),
            DocumentItem(
                id="postal_receipt",
                name="Registered Post Receipt & Postal Tracking Delivery Report",
                name_tamil="பதிவு தபால் ரசீது & டெலிவரி ட்ராக்கிங் அறிக்கை",
                is_mandatory=True,
                category="Communication",
                purpose="Proves that the notice was duly dispatched and served upon the accused drawer.",
                how_to_obtain="Track consignment number on www.indiapost.gov.in and download delivery proof.",
                evidentiary_value="Conclusive Presumption of Service"
            ),
            DocumentItem(
                id="debt_proof",
                name="Underlying Contract / Promissory Note / Invoice proving legal liability",
                name_tamil="பணப் பரிவர்த்தனை / ஒப்பந்த ஆவணம்",
                is_mandatory=False,
                category="Contractual",
                purpose="Rebuts the defense that the cheque was a security or given without consideration.",
                how_to_obtain="Extract invoices, agreements, or ledger statements.",
                evidentiary_value="Corroborative Evidence"
            ),
            DocumentItem(
                id="bank_statement",
                name="Certified Bank Account Statement showing cheque transaction history",
                name_tamil="வங்கி கணக்கு அறிக்கை (Bank Statement)",
                is_mandatory=False,
                category="Financial",
                purpose="Establishes financial capacity and presentation timeline.",
                how_to_obtain="Request certified statement stamped by branch manager.",
                evidentiary_value="Bankers' Books Evidence Act Record"
            )
        ]
    elif "tenan" in cat or "rent" in cat or "house" in cat:
        docs = [
            DocumentItem(
                id="lease_agreement",
                name="Original or Stamped Copy of Rental/Tenancy Agreement",
                name_tamil="வாடகை / குத்தகை ஒப்பந்த ஆவணம்",
                is_mandatory=True,
                category="Contractual",
                purpose="Establishes landlord-tenant relationship, monthly rent amount, and security deposit terms.",
                how_to_obtain="Locate executed stamp paper copy signed by both parties.",
                evidentiary_value="Primary Evidence"
            ),
            DocumentItem(
                id="deposit_receipt",
                name="Security Deposit Payment Proof (Bank Transfer, Cheque, or Cash Receipt)",
                name_tamil="முன்பணம் செலுத்தியதற்கான வங்கி ரசீது",
                is_mandatory=True,
                category="Financial",
                purpose="Irrefutable proof of the deposit amount handed over to the landlord at commencement.",
                how_to_obtain="Download NEFT/IMPS/UPI payment transaction statement from bank.",
                evidentiary_value="Primary Financial Record"
            ),
            DocumentItem(
                id="rent_receipts",
                name="Monthly Rent Receipts or Bank Transfer Records for last 12 months",
                name_tamil="மாதாந்திர வாடகை செலுத்திய ரசீதுகள்",
                is_mandatory=False,
                category="Financial",
                purpose="Proves the tenant was not in default of rent.",
                how_to_obtain="Bank passbook or rent receipts signed by landlord.",
                evidentiary_value="Corroborative Proof"
            ),
            DocumentItem(
                id="vacating_notice",
                name="Written Vacating Notice (Email, WhatsApp, or Registered Letter)",
                name_tamil="வீடு காலி செய்வது குறித்த தகவல் / நோட்டீஸ்",
                is_mandatory=True,
                category="Communication",
                purpose="Demonstrates compliance with the contractual notice period before vacating.",
                how_to_obtain="Export email with timestamp or print registered postal dispatch.",
                evidentiary_value="Secondary Electronic Record"
            ),
            DocumentItem(
                id="handover_proof",
                name="Key Handover Acknowledgment / Inspection Photos of premises",
                name_tamil="சாவி ஒப்படைப்பு ரசீது & வளாக புகைப்படங்கள்",
                is_mandatory=False,
                category="Official/Court",
                purpose="Refutes false counter-claims of property damage or unauthorized retention.",
                how_to_obtain="Photographs taken on phone showing clean condition on date of exit.",
                evidentiary_value="Electronic Evidence (BSA Sec 63)"
            )
        ]
    elif "cyber" in cat or "fraud" in cat:
        docs = [
            DocumentItem(
                id="cyber_acknowledgment",
                name="National Cyber Crime Portal Complaint PDF (cybercrime.gov.in)",
                name_tamil="தேசிய சைபர் குற்ற போர்ட்டல் புகார் நகல்",
                is_mandatory=True,
                category="Official/Court",
                purpose="Official complaint reference number used by police and banks to trace fraudulent accounts.",
                how_to_obtain="Download immediately after lodging complaint on cybercrime.gov.in.",
                evidentiary_value="Official Complaint Record"
            ),
            DocumentItem(
                id="bank_dispute_form",
                name="Bank Transaction Dispute Form & Acknowledgement",
                name_tamil="வங்கி பரிவர்த்தனை மறுப்பு படிவம்",
                is_mandatory=True,
                category="Financial",
                purpose="Invokes RBI Zero Liability Circular for unauthorized electronic banking transactions.",
                how_to_obtain="Submit dispute form at home branch and obtain stamped acknowledgment.",
                evidentiary_value="Financial Dispute Record"
            ),
            DocumentItem(
                id="utr_statement",
                name="Detailed Bank Statement with UTR Numbers and Beneficiary Details",
                name_tamil="UTR எண்கள் கொண்ட விரிவான வங்கி அறிக்கை",
                is_mandatory=True,
                category="Financial",
                purpose="Essential for Cyber Cell investigators to send Section 91 CrPC/BNSS notices to beneficiary banks.",
                how_to_obtain="Branch manager certified account statement.",
                evidentiary_value="Bankers' Books Evidence"
            ),
            DocumentItem(
                id="chat_exports",
                name="Full Chat Transcript / Call Logs with Fraudster",
                name_tamil="மோசடி நபரின் வாட்ஸ்அப் / அழைப்பு விவரங்கள்",
                is_mandatory=False,
                category="Communication",
                purpose="Proves deception, inducement, and fraudulent representation.",
                how_to_obtain="Export unedited WhatsApp chat (.txt) including media.",
                evidentiary_value="Electronic Evidence (requires Sec 63 BSA certificate)"
            )
        ]
    else:
        # Consumer Default
        docs = [
            DocumentItem(
                id="tax_invoice",
                name="Original Retail Tax Invoice / Purchase Bill",
                name_tamil="அசல் வரி விலைப்பட்டியல் / கொள்முதல் பில்",
                is_mandatory=True,
                category="Financial",
                purpose="Mandatory to establish the complainant as a 'Consumer' under Section 2(7) of CPA 2019.",
                how_to_obtain="Obtain from seller or download from e-commerce order history.",
                evidentiary_value="Primary Proof of Purchase"
            ),
            DocumentItem(
                id="warranty_card",
                name="Warranty / Guarantee Card / Service Level Terms",
                name_tamil="உத்தரவாத அட்டை (Warranty Card)",
                is_mandatory=True,
                category="Contractual",
                purpose="Proves existing contractual warranty obligation of manufacturer/dealer.",
                how_to_obtain="Retain manufacturer booklet or terms on invoice.",
                evidentiary_value="Contractual Record"
            ),
            DocumentItem(
                id="service_job_sheets",
                name="Service Center Job Sheets / Repair Refusal Memos",
                name_tamil="சர்வீஸ் சென்டர் ஜாப் ஷீட் மற்றும் பழுதுபார்ப்பு குறிப்பு",
                is_mandatory=True,
                category="Official/Court",
                purpose="Substantiates 'Deficiency in Service' or manufacturing defect.",
                how_to_obtain="Collect stamped job sheet whenever visiting authorized service center.",
                evidentiary_value="Primary Corroboration"
            ),
            DocumentItem(
                id="written_grievance",
                name="Customer Care Complaint Emails & Ticket Numbers",
                name_tamil="வாடிக்கையாளர் சேவைக்கு அனுப்பிய மின்னஞ்சல்கள்",
                is_mandatory=False,
                category="Communication",
                purpose="Demonstrates the consumer exhausted reasonable grievance escalation remedies.",
                how_to_obtain="Print email chain with sent timestamps and ticket numbers.",
                evidentiary_value="Electronic Evidence"
            )
        ]

    mandatory_count = sum(1 for d in docs if d.is_mandatory)
    supportive_count = len(docs) - mandatory_count

    return ChecklistResponse(
        category=req.category,
        total_mandatory=mandatory_count,
        total_supportive=supportive_count,
        documents=docs,
        evidence_golden_rules=golden_rules,
        disclaimer=settings.LEGAL_DISCLAIMER
    )


def run_checklist(req: ChecklistRequest) -> ChecklistResponse:
    prompt = f"""
    Generate an itemized evidence and document checklist under Indian procedural law for:
    Category: {req.category}
    Context: {req.narrative or 'Standard dispute'}
    Language: {req.language}

    Classify documents as mandatory (required for court admission) or supportive.
    Specify BSA 2023 evidentiary values and duplicate retrieval guides.
    """

    return call_gemini_structured(
        prompt=prompt,
        response_schema=ChecklistResponse,
        system_instruction=CHECKLIST_INSTRUCTION,
        mock_fallback_factory=lambda: _generate_mock_checklist(req)
    )
