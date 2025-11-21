from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from backend.services.contact_processor import process_contact_image
from backend.database.connection import get_db
from backend.database.operations import create_contact

router = APIRouter()


@router.post("/", summary="Extract contacts from an uploaded image")
async def extract_contacts(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")

    payload = await file.read()
    if not payload:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        result = await process_contact_image(payload)
        
        # Auto-save extracted contacts to database
        saved_ids = []
        for contact in result.get("contacts", []):
            saved_contact = await create_contact(db, contact)
            saved_ids.append(saved_contact.id)
        
        result["saved_ids"] = saved_ids
        
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:  # Likely OCR/LLM configuration issues
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return JSONResponse(result)
