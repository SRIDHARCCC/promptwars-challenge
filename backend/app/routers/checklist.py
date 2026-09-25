from fastapi import APIRouter, HTTPException
from app.schemas.checklist import ChecklistRequest, ChecklistResponse
from app.agents.evidence_agent import run_checklist

router = APIRouter(prefix="/api/checklist", tags=["Evidence & Documents"])


@router.post("", response_model=ChecklistResponse)
async def generate_document_checklist(req: ChecklistRequest):
    try:
        return run_checklist(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checklist generation failed: {str(e)}")
