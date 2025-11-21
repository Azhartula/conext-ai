from __future__ import annotations

from fastapi import APIRouter, Body, HTTPException
from fastapi.responses import JSONResponse

from backend.core.llm import ContactResponse, improve_contacts as llm_improve_contacts

router = APIRouter()


@router.post("/", summary="Improve existing contact data")
async def improve_contacts(payload: dict = Body(...)) -> JSONResponse:
    raw_contacts = payload.get("contacts")
    if raw_contacts is None or not isinstance(raw_contacts, list):
        raise HTTPException(status_code=400, detail="contacts field is required and must be a list")
    if any(not isinstance(contact, dict) for contact in raw_contacts):
        raise HTTPException(status_code=400, detail="Each contact entry must be an object")

    instructions = payload.get("instructions")
    structured = await llm_improve_contacts(raw_contacts, instructions=instructions)
    return JSONResponse(ContactResponse(contacts=structured.contacts).model_dump())
