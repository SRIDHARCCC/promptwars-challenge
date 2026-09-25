from pydantic import BaseModel, Field
from typing import List, Optional


class TriageRequest(BaseModel):
    narrative: str = Field(..., description="User's description of what happened in plain English or Tamil", min_length=10)
    language: str = Field(default="en", description="Preferred language code ('en' or 'ta')")
    location_state: Optional[str] = Field(default="Tamil Nadu", description="State in India where incident occurred")
    role: Optional[str] = Field(default="victim/complainant", description="User's role e.g. tenant, consumer, employee, recipient of notice")


class StatutoryInfo(BaseModel):
    act_name: str = Field(..., description="Indian law or act (e.g. Consumer Protection Act 2019, Section 138 NI Act, BNS 2023)")
    sections: List[str] = Field(default_factory=list, description="Relevant statutory sections or provisions")
    limitation_period: Optional[str] = Field(None, description="Statutory time limit to initiate action")


class TriageResponse(BaseModel):
    category: str = Field(..., description="Categorized legal domain (e.g. Tenancy, Consumer, Cheque Bounce, Cyber Fraud, Criminal, RERA, Labor)")
    sub_category: Optional[str] = Field(None, description="Specific sub-issue")
    summary: str = Field(..., description="Objective legal summary of the dispute in plain language")
    summary_tamil: Optional[str] = Field(None, description="Summary in Tamil for Tamil users")
    urgency_level: str = Field(..., description="'High', 'Medium', or 'Low'")
    urgency_reason: str = Field(..., description="Why this urgency level was assigned")
    recommended_forum: str = Field(..., description="The primary judicial/quasi-judicial forum to approach")
    alternative_resolution: Optional[str] = Field(None, description="Mediation, Lok Adalat, or ombudsman options")
    statutory_info: StatutoryInfo
    immediate_next_steps: List[str] = Field(..., description="Actionable immediate steps for the citizen")
    dos: List[str] = Field(default_factory=list, description="Immediate protective measures")
    donts: List[str] = Field(default_factory=list, description="Actions to strictly avoid")
    questions_to_clarify: List[str] = Field(default_factory=list, description="Questions the citizen should think about")
    disclaimer: str = Field(..., description="Statutory ethical disclaimer under Advocates Act, 1961")
