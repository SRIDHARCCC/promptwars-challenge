from fastapi import APIRouter, HTTPException
from app.schemas.triage import TriageRequest, TriageResponse
from app.agents.triage_agent import run_triage

router = APIRouter(prefix="/api/triage", tags=["Legal Triage"])


@router.post("", response_model=TriageResponse)
async def triage_grievance(req: TriageRequest):
    try:
        return run_triage(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Triage analysis failed: {str(e)}")
