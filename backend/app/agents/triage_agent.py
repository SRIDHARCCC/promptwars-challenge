import google.adk as adk
from typing import Optional
from app.config import settings
from app.schemas.triage import TriageRequest, TriageResponse, StatutoryInfo
from app.services.gemini_client import call_gemini_structured


TRIAGE_INSTRUCTION = """
You are 'Satta Thozhan' (சட்டத் தோழன்), an expert pre-advocate legal triage assistant for Indian citizens.
Your mission is to understand a citizen's dispute, reassure them, and map their situation to the appropriate Indian legal framework before they consult an advocate.

LEGAL SCOPE TO MAP:
1. Consumer Disputes: Consumer Protection Act 2019 (District / State / National Commission; E-Daakhil)
2. Cheque Bounce / Debt: Section 138 Negotiable Instruments Act, 1881 (Statutory 30-day notice, 15-day cure period, Judicial Magistrate Court)
3. Tenancy & Rent: State Rent Control Acts / Model Tenancy Act (Rent Court / Rent Tribunal)
4. Builder / Real Estate: RERA (Real Estate Regulatory Authority)
5. Police & Criminal: Bharatiya Nyaya Sanhita (BNS) & Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (Zero FIR, Section 173 BNSS complaint)
6. Cyber Crime & Fraud: IT Act, National Cyber Crime Portal (1930 Helpline)
7. Employment / Wages: Industrial Disputes Act, Payment of Wages Act (Labor Conciliation Officer / Labor Court)

RULES:
- Maintain an objective, calming, and structured tone.
- Do NOT provide formal legal advice or guarantee outcomes. Always include the statutory disclaimer under the Advocates Act, 1961.
- Provide practical immediate 'dos' and 'donts' (e.g. "Do not delete chat logs", "Do send a registered postal notice").
- If requested language is Tamil or narrative contains Tamil, provide summary_tamil.
"""

triage_adk_agent = adk.Agent(
    name="legal_triage_navigator",
    description="Maps citizen grievances to Indian legal categories, forums, and statutes.",
    instruction=TRIAGE_INSTRUCTION,
    model=settings.DEFAULT_MODEL,
)


def _generate_mock_triage(req: TriageRequest) -> TriageResponse:
    """Intelligent rule-based fallback when offline or demoing without API keys."""
    text = req.narrative.lower()

    if any(k in text for k in ["cheque", "check", "bounce", "dishonour", "138", "insufficient"]):
        category = "Cheque Bounce & Debt Recovery"
        sub_cat = "Dishonour of Cheque under Section 138 NI Act"
        act = "Negotiable Instruments Act, 1881"
        sections = ["Section 138", "Section 141 (if company)", "Section 142"]
        limitation = "Statutory demand notice must be dispatched within 30 days of receiving bank return memo. Complaint within 30 days of 15-day notice expiry."
        forum = "Court of Judicial Magistrate First Class / Metropolitan Magistrate"
        summary = "Dishonour of cheque due to insufficient funds or stop payment instructions, requiring mandatory statutory notice."
        summary_ta = "காசோலை பவுன்ஸ் (Cheque Bounce) விவகாரம் - 30 நாட்களுக்குள் சட்டப்பூர்வ நோட்டீஸ் அனுப்ப வேண்டும்."
        urgency = "High"
        urgency_reason = "Strict 30-day statutory limitation window for issuing legal demand notice."
        dos = [
            "Collect original cheque and Bank Return Memo immediately.",
            "Draft and dispatch a statutory legal notice via Registered Post A.D. within 30 days.",
            "Retain the postal receipt and track delivery acknowledgment on indiapost.gov.in."
        ]
        donts = [
            "Do not delay sending the notice beyond 30 days from the date of the bank memo.",
            "Do not hand over original cheque to the drawer without a written settlement agreement."
        ]
    elif any(k in text for k in ["landlord", "tenant", "rent", "deposit", "lease", "evict", "flat owner"]):
        category = "Tenancy & Housing"
        sub_cat = "Security Deposit Dispute / Unlawful Eviction"
        act = "Tamil Nadu Regulation of Rights and Responsibilities of Landlords and Tenants Act, 2017 (or State Tenancy Act)"
        sections = ["Section 21 (Tenancy Agreement)", "Section 22 (Security Deposit)", "Model Tenancy Act provisions"]
        limitation = "3 years for civil recovery of debt; immediate complaint before Rent Authority."
        forum = "Rent Court / Rent Tribunal / Civil Court"
        summary = "Dispute regarding tenancy rights, return of caution deposit, or maintenance obligations."
        summary_ta = "வாடகை ஒப்பந்தம் மற்றும் முன்பணம் (Security Deposit) திரும்பப் பெறுதல் தொடர்பான விவகாரம்."
        urgency = "Medium"
        urgency_reason = "Civil recovery matter; important to establish written evidence before vacating."
        dos = [
            "Keep signed copy of the Rental/Lease Agreement.",
            "Collect bank transfer receipts showing initial security deposit and monthly rent payments.",
            "Take timestamped photos/videos of premises showing vacating condition."
        ]
        donts = [
            "Do not hand over keys without a written acknowledgement or signed handover note.",
            "Do not rely solely on verbal promises for deposit refund."
        ]
    elif any(k in text for k in ["cyber", "fraud", "scam", "upi", "otp", "phishing", "hacked", "stolen money"]):
        category = "Cyber Crime & Financial Fraud"
        sub_cat = "Unauthorized Electronic Fund Transfer / Online Financial Scam"
        act = "Information Technology Act, 2000 & Bharatiya Nyaya Sanhita (BNS), 2023"
        sections = ["Section 66D IT Act (Cheating by personation)", "Section 318 BNS (Cheating)"]
        limitation = "Immediate reporting within 'Golden Hours' (2-4 hours) maximizes chance of freezing funds."
        forum = "National Cyber Crime Reporting Portal (cybercrime.gov.in) / Cyber Cell Police Station"
        summary = "Unauthorized withdrawal or digital deception leading to financial loss."
        summary_ta = "சைபர் மோசடி மற்றும் ஆன்லைன் பண இழப்பு - உடனடி புகார் தேவை."
        urgency = "High"
        urgency_reason = "Financial fraud accounts must be frozen before scammers siphon money through mule accounts."
        dos = [
            "Dial 1930 (National Cyber Financial Fraud Helpline) immediately to report fraudulent transactions.",
            "File complaint on cybercrime.gov.in and download the acknowledgment PDF.",
            "Request your bank in writing to freeze the recipient account and dispute the transaction.",
            "Export WhatsApp chats, SMS alerts, UPI transaction reference numbers (UTR)."
        ]
        donts = [
            "Do not delete the scammer's messages, calls, or payment links.",
            "Do not share any further OTPs or click unknown remote desktop links (AnyDesk, TeamViewer)."
        ]
    elif any(k in text for k in ["police", "fir", "assault", "threat", "fight", "theft", "beaten", "harass"]):
        category = "Criminal Law & Police Complaint"
        sub_cat = "Cognizable Offence Reporting"
        act = "Bharatiya Nyaya Sanhita (BNS) & Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023"
        sections = ["Section 173 BNSS (Filing of Information in Cognizable Cases)", "Section 351/352 BNS"]
        limitation = "Prompt reporting is critical; delay must be justified in statement."
        forum = "Local Police Station (Jurisdictional SHO) / Judicial Magistrate (Section 175 BNSS)"
        summary = "Complaint involving threat to safety, bodily harm, intimidation, or property crime."
        summary_ta = "காவல் நிலைய புகார் மற்றும் பாதுகாப்பு தொடர்பான விவகாரம் (BNS/BNSS)."
        urgency = "High"
        urgency_reason = "Personal safety and criminal evidence preservation."
        dos = [
            "Submit a signed, written complaint clearly stating date, time, location, and witnesses.",
            "Obtain a CSR (Community Service Register) receipt or FIR copy free of cost.",
            "In case of bodily injury, undergo a medical examination at a Government Hospital for MLC (Medico-Legal Certificate)."
        ]
        donts = [
            "Do not leave the police station without an acknowledgment receipt (CSR/FIR number).",
            "Do not sign blank papers or unread statements."
        ]
    elif any(k in text for k in ["salary", "job", "employer", "company", "fired", "gratuity", "provident fund", "pf"]):
        category = "Labor & Employment"
        sub_cat = "Unpaid Wages / Wrongful Termination"
        act = "Payment of Wages Act, 1936 & Industrial Disputes Act, 1947"
        sections = ["Section 15 Payment of Wages Act", "Section 2A Industrial Disputes Act"]
        limitation = "Claims for unpaid wages must generally be submitted within 12 months."
        forum = "Labor Conciliation Officer / Labor Court / Controlling Authority for Gratuity"
        summary = "Grievance against employer for withheld salary, notice pay, gratuity, or severance."
        summary_ta = "ஊதிய பாக்கி மற்றும் வேலைநீக்கம் தொடர்பான தொழிலாளர் விவகாரம்."
        urgency = "Medium"
        urgency_reason = "Statutory limitation rules apply to wage and labor claims."
        dos = [
            "Preserve Appointment Letter, Relieving Letter/Termination Email, and Salary Slips.",
            "Download EPF passbook statement and Form 16.",
            "Maintain records of official email correspondence regarding pending dues."
        ]
        donts = [
            "Do not sign a full and final settlement receipt until all dues are correctly credited.",
            "Do not post defamatory statements about the employer on social media."
        ]
    else:
        # Default: Consumer Dispute
        category = "Consumer Protection"
        sub_cat = "Deficiency in Service / Unfair Trade Practice"
        act = "Consumer Protection Act, 2019"
        sections = ["Section 2(11) Deficiency in Service", "Section 35 Consumer Complaint"]
        limitation = "2 years from the date on which the cause of action arose."
        forum = "District Consumer Disputes Redressal Commission (DCDRC) / E-Daakhil"
        summary = "Grievance involving defective goods, service deficiency, or unfair commercial conduct."
        summary_ta = "நுகர்வோர் குறைதீர்வு விவகாரம் (Consumer Protection Act, 2019)."
        urgency = "Medium"
        urgency_reason = "2-year limitation period under Section 69 of Consumer Protection Act, 2019."
        dos = [
            "Preserve original retail invoice/tax bill and warranty card.",
            "Keep record of written complaints/emails sent to customer support with ticket numbers.",
            "Check jurisdiction on E-Daakhil (edaakhil.nic.in) for online complaint filing."
        ]
        donts = [
            "Do not discard the defective item or packaging until inspection is complete.",
            "Do not accept partial settlement without written reservation of rights."
        ]

    return TriageResponse(
        category=category,
        sub_category=sub_cat,
        summary=summary,
        summary_tamil=summary_ta,
        urgency_level=urgency,
        urgency_reason=urgency_reason,
        recommended_forum=forum,
        alternative_resolution="Pre-litigation Mediation / National Consumer Helpline (1915) / Lok Adalat",
        statutory_info=StatutoryInfo(
            act_name=act,
            sections=sections,
            limitation_period=limitation
        ),
        immediate_next_steps=[
            f"Collate all transaction records and communicate only in writing.",
            f"Review the required document checklist for {category}.",
            f"Schedule a consultation with an enrolled advocate specializing in {category}."
        ],
        dos=dos,
        donts=donts,
        questions_to_clarify=[
            "When did the last transaction or communication take place?",
            "Do you have signed written proof of the agreement or receipt?",
            "What is the exact financial loss or compensation you wish to claim?"
        ],
        disclaimer=settings.LEGAL_DISCLAIMER
    )


def run_triage(req: TriageRequest) -> TriageResponse:
    prompt = f"""
    Analyze this citizen's grievance under Indian law:
    - Narrative: {req.narrative}
    - Location State: {req.location_state}
    - User Role: {req.role}
    - Language requested: {req.language}

    Classify into Indian legal category, state governing law and section, recommend the correct forum,
    detail statutory limitation deadlines, urgency, actionable dos and don'ts, and plain-language summary.
    """
    
    return call_gemini_structured(
        prompt=prompt,
        response_schema=TriageResponse,
        system_instruction=TRIAGE_INSTRUCTION,
        mock_fallback_factory=lambda: _generate_mock_triage(req)
    )
