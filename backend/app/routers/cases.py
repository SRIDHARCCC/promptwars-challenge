"""
API routes for saving and managing citizen legal consultation cases in Firestore.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from app.services.firestore_service import firestore_service

router = APIRouter(prefix="/api/cases", tags=["Consultation Cases"])


class SaveCaseRequest(BaseModel):
    id: Optional[str] = Field(None, description="Existing case ID if updating")
    auth_id: str = Field(..., description="Firebase Auth UID of customer")
    client_name: Optional[str] = Field("Citizen Client", description="Name of the citizen")
    client_email: Optional[str] = Field(None, description="Email of the citizen")
    category: str = Field(..., description="Legal category")
    narrative: str = Field(..., description="Grievance statement")
    language: str = Field("en", description="Language: 'en' or 'ta'")
    triage_result: Optional[Dict[str, Any]] = Field(default_factory=dict)
    evidence_checklist: Optional[Dict[str, Any]] = Field(default_factory=dict)
    prep_sheet: Optional[Dict[str, Any]] = Field(default_factory=dict)


@router.get("", response_model=List[Dict[str, Any]])
async def list_cases(auth_id: str = Query(..., description="Firebase Auth UID")):
    """List all saved legal consultations for a customer."""
    try:
        cases = firestore_service.list_user_consultations(auth_id)
        return cases
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=Dict[str, Any])
async def save_case(payload: SaveCaseRequest):
    """Save or update a customer consultation query and prep sheet in Firestore."""
    try:
        data = payload.model_dump()
        saved = firestore_service.save_consultation(data)
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{case_id}", response_model=Dict[str, Any])
async def get_case(case_id: str):
    """Retrieve a single case consultation by ID."""
    case = firestore_service.get_consultation(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Consultation case not found")
    return case
