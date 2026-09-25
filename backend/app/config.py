import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="allow", env_file=".env")

    APP_NAME: str = "Satta Thozhan (சட்டத் தோழன்)"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Gemini / Vertex AI Configuration
    # Supports Gemini 3.8 Flash, 3.7 Flash, or 2.5 Flash
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    GOOGLE_CLOUD_LOCATION: str = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "gemini-2.5-flash")
    FALLBACK_MODEL: str = "gemini-2.5-flash"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Legal Disclaimer
    LEGAL_DISCLAIMER: str = (
        "Satta Thozhan is an educational and informational legal triage assistant. "
        "It does not provide certified legal advice or constitute an advocate-client relationship "
        "under the Advocates Act, 1961. Always consult an enrolled advocate for legal representation."
    )


settings = Settings()
