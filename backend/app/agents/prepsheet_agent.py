import google.adk as adk
from typing import List
from app.config import settings
from app.schemas.prepsheet import PrepSheetRequest, PrepSheetResponse, TimelineEvent
from app.services.gemini_client import call_gemini_structured

PREPSHEET_INSTRUCTION = """
You are the Advocate Briefing Specialist for 'Satta Thozhan'.
Your goal is to compile a crystal-clear, structured 1-Page Advocate Consultation Prep Sheet for an Indian citizen.

This sheet is specifically designed to be printed or handed directly to an enrolled advocate during the first meeting.
Advocates appreciate:
1. Concise chronological facts (date-wise).
2. Explicit statement of relief sought (e.g. monetary recovery, damages, police action, quashing).
3. Clear status of ready vs missing documents.
4. Smart, legally intelligent questions for the citizen to ask the advocate (e.g., limitation period, court fees, chances of interim relief, settlement vs trial).

TONE & FORMAT:
- Professional, objective, crisp.
- Highlight Indian procedural considerations (jurisdiction, limitation, fees).
"""

prepsheet_adk_agent = adk.Agent(
    name="advocate_prepsheet_compiler",
    description="Compiles structured consultation briefing sheets for advocates.",
    instruction=PREPSHEET_INSTRUCTION,
    model=settings.DEFAULT_MODEL,
)


def _generate_mock_prepsheet(req: PrepSheetRequest) -> PrepSheetResponse:
    # Build default timeline if empty
    timeline = req.timeline
    if not timeline:
        timeline = [
            TimelineEvent(
                date_or_period="Event 1 (Initial Transaction)",
                event_description="Parties entered into arrangement / transaction or agreement.",
                supporting_document_ref="Initial receipt or agreement copy"
            ),
            TimelineEvent(
                date_or_period="Event 2 (Dispute Origin)",
                event_description="Default in obligation / dispute arose / communication broke down.",
                supporting_document_ref="Email / WhatsApp communication"
            ),
            TimelineEvent(
                date_or_period="Event 3 (Latest Incident)",
                event_description="Final demand made or notice received.",
                supporting_document_ref="Notice or bank statement"
            )
        ]

    ready_count = len(req.ready_documents)
    missing_count = len(req.missing_documents)
    
    questions = [
        "What is the exact statutory limitation deadline to file this case or send a formal legal notice?",
        "Which court or forum holds both territorial and pecuniary jurisdiction for my matter?",
        "What are the estimated court fees and procedural costs involved?",
        "Is this dispute eligible for mandatory pre-institution mediation or Lok Adalat settlement?",
        "Can we seek any interim or urgent relief (e.g. stay order or freezing order) at the initial hearing?"
    ]

    synopsis = f"Matter pertains to {req.category}: {req.case_title}. {req.narrative[:400]}..."
    synopsis_ta = f"வழக்கு விவரம் ({req.category}): {req.case_title}. வழக்கறிஞர் ஆலோசனைக்கான சுருக்கமான குறிப்பு."

    relief_list = [
        req.relief_sought,
        "Award of reasonable litigation costs and advocate fees",
        "Statutory interest on withheld amounts where applicable"
    ]

    return PrepSheetResponse(
        title=f"Legal Briefing & Consultation Sheet: {req.case_title}",
        client_name=req.user_name or "Citizen Client",
        category=req.category,
        governing_laws=[
            "Relevant Indian Statutes and High Court rules for territorial jurisdiction",
            "Bharatiya Sakshya Adhiniyam, 2023 (Admissibility of evidence)"
        ],
        factual_synopsis=synopsis,
        factual_synopsis_tamil=synopsis_ta,
        chronological_timeline=timeline,
        relief_sought_breakdown=relief_list,
        evidence_readiness_status={
            "ready_count": ready_count,
            "missing_count": missing_count,
            "ready": req.ready_documents,
            "missing": req.missing_documents
        },
        top_questions_for_advocate=questions,
        estimated_forum_and_process="Jurisdictional Civil / Consumer / Criminal Court. Initial step: Issue formal legal notice or file complaint with sworn affidavit.",
        advocate_notes_section="[For Advocate's Notes: Limitation, Territorial Jurisdiction, Required Court Fee Stamps, Next Hearing/Filing Target Date]",
        disclaimer=settings.LEGAL_DISCLAIMER
    )


def run_prepsheet(req: PrepSheetRequest) -> PrepSheetResponse:
    prompt = f"""
    Compile a 1-page Advocate Consultation Prep Sheet under Indian legal standards:
    - Client: {req.user_name}
    - Case Title: {req.case_title}
    - Category: {req.category}
    - Narrative: {req.narrative}
    - Relief Sought: {req.relief_sought}
    - Ready Documents: {', '.join(req.ready_documents)}
    - Missing Documents: {', '.join(req.missing_documents)}
    - Language: {req.language}

    Structure with factual synopsis, chronological timeline, relief breakdown, evidence audit,
    and 5 targeted, high-leverage legal questions for the citizen to ask their advocate.
    """

    return call_gemini_structured(
        prompt=prompt,
        response_schema=PrepSheetResponse,
        system_instruction=PREPSHEET_INSTRUCTION,
        mock_fallback_factory=lambda: _generate_mock_prepsheet(req)
    )
