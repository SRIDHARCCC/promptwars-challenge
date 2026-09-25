import os
import json
import logging
from typing import Type, TypeVar, Optional, Any
from pydantic import BaseModel
from app.config import settings

logger = logging.getLogger("satta_thozhan.gemini")

T = TypeVar("T", bound=BaseModel)

_client = None

def get_genai_client():
    global _client
    if _client is not None:
        return _client
    
    try:
        from google import genai
        # If Vertex AI project is set, use Vertex AI mode
        if settings.GOOGLE_CLOUD_PROJECT:
            logger.info(f"Initializing Gemini Client in Vertex AI mode for project: {settings.GOOGLE_CLOUD_PROJECT}")
            _client = genai.Client(
                vertexai=True,
                project=settings.GOOGLE_CLOUD_PROJECT,
                location=settings.GOOGLE_CLOUD_LOCATION
            )
        elif settings.GEMINI_API_KEY:
            logger.info("Initializing Gemini Client with API key")
            _client = genai.Client(api_key=settings.GEMINI_API_KEY)
        else:
            # Fallback client without explicit credentials for local inspection
            logger.warning("No GEMINI_API_KEY or GOOGLE_CLOUD_PROJECT set. Running in demo/mock-enabled mode.")
            _client = None
    except Exception as e:
        logger.error(f"Failed to initialize Google GenAI client: {e}")
        _client = None
        
    return _client


def call_gemini_structured(
    prompt: str,
    response_schema: Type[T],
    system_instruction: Optional[str] = None,
    mock_fallback_factory: Optional[Any] = None
) -> T:
    """
    Executes structured generation using Gemini Flash via google-genai.
    Falls back gracefully to mock_fallback_factory if API credentials are not provided or error occurs.
    """
    client = get_genai_client()
    
    if client:
        # Determine model
        models_to_try = [settings.DEFAULT_MODEL, "gemini-2.5-flash"]
        for model_name in models_to_try:
            try:
                from google.genai import types
                
                config = types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=response_schema,
                    temperature=0.2,
                )
                if system_instruction:
                    config.system_instruction = system_instruction

                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )
                
                if response.text:
                    parsed = json.loads(response.text)
                    return response_schema.model_validate(parsed)
            except Exception as ex:
                logger.warning(f"Error calling Gemini model '{model_name}': {ex}. Trying fallback if available.")
                continue

    # If client is not available or calls failed, use mock fallback for guaranteed local operation
    if mock_fallback_factory:
        logger.info("Using domain-grounded fallback response.")
        return mock_fallback_factory()

    raise RuntimeError("Gemini API call failed and no fallback factory was provided.")
