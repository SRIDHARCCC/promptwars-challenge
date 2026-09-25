from fastapi import APIRouter, HTTPException
from app.schemas.prepsheet import PrepSheetRequest, PrepSheetResponse
from app.agents.prepsheet_agent import run_prepsheet

router = APIRouter(prefix="/api/prepsheet", tags=["Advocate Prep Sheet"])


@router.post("", response_model=PrepSheetResponse)
async def generate_prep_sheet(req: PrepSheetRequest):
    try:
        return run_prepsheet(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prep sheet compilation failed: {str(e)}")
