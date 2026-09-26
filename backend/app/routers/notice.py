from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.schemas.notice import NoticeAnalysisResponse
from app.agents.notice_agent import run_notice_analysis
from app.services.document_parser import extract_text_from_pdf

router = APIRouter(prefix="/api/notice", tags=["Notice & Summons Auditor"])


class TextNoticeRequest(BaseModel):
    text: str
    document_title: Optional[str] = "Uploaded Legal Notice"


MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB safety limit against DoS


@router.post(
    "/analyze-text",
    response_model=NoticeAnalysisResponse,
    responses={400: {"description": "Validation error"}, 500: {"description": "Processing error"}}
)
async def analyze_notice_text(req: TextNoticeRequest):
    if len(req.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Notice text is too short to analyze.")
    try:
        return run_notice_analysis(req.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Notice analysis failed: {str(e)}")


@router.post(
    "/upload",
    response_model=NoticeAnalysisResponse,
    responses={
        400: {"description": "Invalid file format or empty file"},
        413: {"description": "File payload exceeds 5MB size limit"},
        500: {"description": "Processing error"}
    }
)
async def upload_and_analyze_notice(file: UploadFile = File(...)):
    filename = file.filename or ""
    content_type = file.content_type or ""

    if not (filename.lower().endswith(".pdf") or "pdf" in content_type.lower() or filename.lower().endswith(".txt")):
        raise HTTPException(
            status_code=400,
            detail="Currently, PDF (.pdf) and plain text (.txt) files are supported for legal notice audit."
        )

    # Read and enforce file size limit
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
        )

    # Validate PDF signature magic bytes
    if filename.lower().endswith(".pdf") and not file_bytes.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file format. The file header does not match standard PDF specifications."
        )

    try:
        if filename.lower().endswith(".txt"):
            extracted_text = file_bytes.decode("utf-8", errors="ignore")
        else:
            extracted_text, metadata = extract_text_from_pdf(file_bytes)

        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract readable text from this document.")

        return run_notice_analysis(extracted_text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process and analyze document: {str(e)}")
