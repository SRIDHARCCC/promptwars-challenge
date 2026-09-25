from pydantic import BaseModel, Field
from typing import List, Optional


class DocumentItem(BaseModel):
    id: str = Field(..., description="Unique slug or identifier")
    name: str = Field(..., description="Name of the document (English)")
    name_tamil: Optional[str] = Field(None, description="Name of the document (Tamil)")
    is_mandatory: bool = Field(..., description="True if mandatory for court admission or police complaint, False if supportive")
    category: str = Field(..., description="'Identification', 'Contractual', 'Financial', 'Communication', 'Official/Court'")
    purpose: str = Field(..., description="Why this document is required under Indian law/rules")
    how_to_obtain: str = Field(..., description="Guidance if the citizen is missing this document or needs a duplicate")
    evidentiary_value: str = Field(..., description="Primary evidence or Secondary evidence under Bharatiya Sakshya Adhiniyam (BSA)")


class ChecklistRequest(BaseModel):
    category: str = Field(..., description="Legal category identified from triage")
    narrative: Optional[str] = Field(None, description="Contextual grievance summary")
    language: str = Field(default="en", description="'en' or 'ta'")


class ChecklistResponse(BaseModel):
    category: str
    total_mandatory: int
    total_supportive: int
    documents: List[DocumentItem]
    evidence_golden_rules: List[str] = Field(
        default_factory=list,
        description="Key evidence preservation tips (e.g. Section 63 BSA certificate for electronic records)"
    )
    disclaimer: str
