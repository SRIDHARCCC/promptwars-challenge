from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import triage, checklist, notice, prepsheet, cases

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Intelligent Citizen Pre-Advocate Legal Navigator for India (Google ADK 2.0 & Gemini Flash)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(triage.router)
app.include_router(checklist.router)
app.include_router(notice.router)
app.include_router(prepsheet.router)
app.include_router(cases.router)


@app.get("/api/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "model": settings.DEFAULT_MODEL,
        "framework": "Google ADK 2.0 + Gemini Flash (Vertex AI / GenAI)",
        "disclaimer": settings.LEGAL_DISCLAIMER
    }


@app.get("/api/disclaimer", tags=["Legal"])
async def get_statutory_disclaimer():
    return {
        "governing_framework": "Advocates Act, 1961 (India)",
        "purpose": "Citizen Legal Triage & Document Preparation",
        "disclaimer": settings.LEGAL_DISCLAIMER,
        "notice": (
            "This service provides automated procedural information, document organization, and triage. "
            "It does not create an advocate-client relationship. Users should always consult an enrolled "
            "advocate before undertaking formal litigation or signing legal affidavits."
        )
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Satta Thozhan API (சட்டத் தோழன்). Visit /docs for API documentation.",
        "health": "/api/health"
    }
