from pydantic import BaseModel, Field
from typing import List, Optional


class TimelineEvent(BaseModel):
    date_or_period: str = Field(..., description="Date or rough timeframe (e.g. 12-Jan-2026, or 'First week of March 2026')")
    event_description: str = Field(..., description="What transpired (payment, agreement, verbal dispute, notice delivered)")
    supporting_document_ref: Optional[str] = Field(None, description="Linked document name e.g. 'Bank Statement page 2'")


class PrepSheetRequest(BaseModel):
    user_name: Optional[str] = Field(default="Citizen", description="Citizen name for the briefing title")
    case_title: str = Field(..., description="Brief title e.g. 'Security Deposit Non-Refund by Landlord'")
    category: str = Field(..., description="Legal category")
    narrative: str = Field(..., description="Full narrative of facts")
    relief_sought: str = Field(..., description="What the citizen wants to achieve (e.g. Full refund of 1 lakh + interest + damages)")
    timeline: List[TimelineEvent] = Field(default_factory=list, description="Chronological timeline of events")
    ready_documents: List[str] = Field(default_factory=list, description="Documents user has collected")
    missing_documents: List[str] = Field(default_factory=list, description="Documents still needed or missing")
    budget_or_urgency_notes: Optional[str] = Field(None, description="Notes on legal budget or time constraints")
    language: str = Field(default="en", description="'en' or 'ta'")


class EvidenceReadinessStatus(BaseModel):
    ready_count: int = Field(default=0, description="Count of ready documents")
    missing_count: int = Field(default=0, description="Count of missing documents")
    ready: List[str] = Field(default_factory=list, description="List of ready document names")
    missing: List[str] = Field(default_factory=list, description="List of missing document names")


class PrepSheetResponse(BaseModel):
    title: str
    client_name: str
    category: str
    governing_laws: List[str]
    factual_synopsis: str
    factual_synopsis_tamil: Optional[str] = None
    chronological_timeline: List[TimelineEvent]
    relief_sought_breakdown: List[str]
    evidence_readiness_status: EvidenceReadinessStatus = Field(default_factory=EvidenceReadinessStatus)
    top_questions_for_advocate: List[str]
    estimated_forum_and_process: str
    advocate_notes_section: str = "Space for advocate's consultation notes, court fee calculation, and case diary entry."
    disclaimer: str
