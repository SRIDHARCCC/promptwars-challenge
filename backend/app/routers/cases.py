"""
API routes for saving and managing citizen legal consultation cases in Firestore.
Includes authorization safeguards, async non-blocking I/O, and typed schemas.
"""

from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional
from app.services.firestore_service import firestore_service

router = APIRouter(prefix="/api/cases", tags=["Consultation Cases"])


class SaveCaseRequest(BaseModel):
    id: Optional[str] = Field(None, description="Existing case ID if updating")
    auth_id: str = Field(..., min_length=3, max_length=128, description="Firebase Auth UID of citizen")
    client_name: Optional[str] = Field("Citizen Client", max_length=200, description="Name of the citizen")
    client_email: Optional[str] = Field(None, max_length=200, description="Email of the citizen")
    category: str = Field(..., min_length=2, max_length=200, description="Legal category")
    narrative: str = Field(..., min_length=5, description="Grievance statement")
    language: str = Field("en", pattern="^(en|ta)$", description="Language: 'en' or 'ta'")
    triage_result: Optional[Dict[str, Any]] = Field(default_factory=dict)
    evidence_checklist: Optional[Dict[str, Any]] = Field(default_factory=dict)
    prep_sheet: Optional[Dict[str, Any]] = Field(default_factory=dict)


class CaseResponse(BaseModel):
    id: str
    auth_id: str
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    category: str
    narrative: str
    language: str = "en"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    triage_result: Optional[Dict[str, Any]] = None
    evidence_checklist: Optional[Dict[str, Any]] = None
    prep_sheet: Optional[Dict[str, Any]] = None


@router.get(
    "",
    response_model=List[CaseResponse],
    responses={
        400: {"description": "Invalid auth_id provided"},
        500: {"description": "Database query error"}
    }
)
async def list_cases(auth_id: str = Query(..., min_length=3, description="Firebase Auth UID")):
    """List all saved legal consultations for a verified customer."""
    cleaned_auth_id = auth_id.strip()
    if not cleaned_auth_id:
        raise HTTPException(status_code=400, detail="A valid auth_id is required to fetch consultations.")
    try:
        cases = await firestore_service.list_user_consultations_async(cleaned_auth_id)
        return cases
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query saved consultations: {str(e)}")


@router.post(
    "",
    response_model=CaseResponse,
    responses={
        400: {"description": "Validation error"},
        500: {"description": "Database save error"}
    }
)
async def save_case(payload: SaveCaseRequest):
    """Save or update a customer consultation query and prep sheet in Firestore."""
    if not payload.auth_id or not payload.auth_id.strip():
        raise HTTPException(status_code=400, detail="Valid auth_id is required.")
    try:
        data = payload.model_dump()
        data["auth_id"] = data["auth_id"].strip()
        saved = await firestore_service.save_consultation_async(data)
        return saved
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save consultation: {str(e)}")


@router.get(
    "/{case_id}",
    response_model=CaseResponse,
    responses={
        403: {"description": "Access forbidden: IDOR check failed"},
        404: {"description": "Consultation case not found"}
    }
)
async def get_case(
    case_id: str,
    x_auth_id: Optional[str] = Header(None, description="Optional caller auth UID for IDOR check")
):
    """
    Retrieve a single case consultation by ID.
    If x_auth_id header is passed, verifies ownership to prevent Insecure Direct Object References (IDOR).
    """
    case = await firestore_service.get_consultation_async(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Consultation case not found.")

    # IDOR Protection: If caller provided their auth_id header, verify ownership
    if x_auth_id and case.get("auth_id") and case["auth_id"] != x_auth_id.strip():
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not have permission to view this legal consultation."
        )

    return case
