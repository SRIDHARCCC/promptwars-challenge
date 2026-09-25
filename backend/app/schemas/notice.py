from pydantic import BaseModel, Field
from typing import List, Optional


class NoticeAnalysisResponse(BaseModel):
    document_type: str = Field(..., description="'Legal Notice', 'Court Summons', 'Police Notice (BNSS)', 'Demand Notice (Sec 138)', 'Employment Termination', etc.")
    sender_name: Optional[str] = Field(None, description="Name of party or advocate issuing the notice")
    sender_role: Optional[str] = Field(None, description="Advocate, Bank, Landlord, Police Station, Court")
    recipient_name: Optional[str] = Field(None, description="Recipient named in the document")
    date_of_notice: Optional[str] = Field(None, description="Date printed on the document")
    response_deadline_days: Optional[int] = Field(None, description="Statutory or stated deadline to reply (e.g. 15 days, 30 days)")
    deadline_urgency: str = Field(..., description="'Critical', 'High', 'Moderate', 'Informational'")
    monetary_claim: Optional[str] = Field(None, description="Any sum of money demanded (e.g. INR 2,50,000)")
    key_allegations: List[str] = Field(default_factory=list, description="Core claims or allegations made against user")
    relevant_statutes_cited: List[str] = Field(default_factory=list, description="Acts/Sections cited by the sender")
    immediate_dos: List[str] = Field(default_factory=list, description="Immediate protective steps (e.g. preserve envelope with postmark)")
    immediate_donts: List[str] = Field(default_factory=list, description="Dangerous actions to avoid (e.g. do not reply informally without counsel)")
    recommended_advocate_action: str = Field(..., description="Actionable recommendation for engaging an advocate")
    disclaimer: str
