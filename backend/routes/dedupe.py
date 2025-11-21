"""
Intelligent deduplication route using semantic similarity.
"""

from typing import Any

from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse

from backend.core.llm import deduplicate_contacts

router = APIRouter()


@router.post("/")
async def dedupe_contacts(payload: dict = Body(...)) -> JSONResponse:
    """
    Detect and merge duplicate contacts using semantic similarity.
    
    Expects:
    {
      "contacts": [
        {"name": "...", "phone": "...", ...},
        ...
      ]
    }
    
    Returns merged contacts with duplicate indicators.
    """
    contacts = payload.get("contacts")
    if not isinstance(contacts, list):
        return JSONResponse(
            status_code=400,
            content={"error": "Expected 'contacts' to be a list."},
        )

    try:
        result = await deduplicate_contacts(contacts)
        return JSONResponse(
            content={
                "contacts": [c.model_dump(mode="json") for c in result.contacts],
                "meta": {
                    "original_count": len(contacts),
                    "merged_count": len(result.contacts),
                    "duplicates_found": len(contacts) - len(result.contacts),
                },
            }
        )
    except ValueError as ve:
        return JSONResponse(status_code=400, content={"error": str(ve)})
    except RuntimeError as re:
        return JSONResponse(status_code=500, content={"error": str(re)})
