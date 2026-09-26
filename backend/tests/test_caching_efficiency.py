import time
from app.services.gemini_client import call_gemini_structured, _GEMINI_CACHE
from app.schemas.triage import TriageResponse


def test_gemini_response_caching():
    """Verify that repeat queries are retrieved from memory cache for near-instant efficiency."""
    prompt = "Unique Legal Query for Caching Verification: Tenant security deposit"

    # First call fills cache
    res1 = call_gemini_structured(
        prompt=prompt,
        response_schema=TriageResponse,
        mock_fallback_factory=lambda: TriageResponse(
            category="Tenancy & Housing",
            summary="Cached summary",
            urgency_level="Medium",
            urgency_reason="Reason",
            recommended_forum="Rent Court",
            statutory_info={
                "act_name": "Tenancy Act",
                "sections": ["Section 21"]
            },
            dos=["Do preserve lease"],
            donts=["Do not vacate early"],
            immediate_next_steps=["Contact advocate"],
            disclaimer="Disclaimer"
        )
    )

    # Second call should be served directly from cache in sub-millisecond time
    start = time.perf_counter()
    res2 = call_gemini_structured(
        prompt=prompt,
        response_schema=TriageResponse
    )
    duration = time.perf_counter() - start

    assert res1.category == res2.category
    assert res2.summary == "Cached summary"
    # Cached lookup should complete in under 5ms
    assert duration < 0.005
