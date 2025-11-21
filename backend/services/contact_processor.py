from __future__ import annotations

from backend.core.llm import structure_contacts
from backend.core.normalize import normalize_email, normalize_phone
from backend.core.ocr import run_ocr


async def process_contact_image(image_bytes: bytes):
    """Run OCR + LLM structuring pipeline."""
    ocr_result = await run_ocr(image_bytes)
    structured = await structure_contacts(ocr_result["text"])
    contacts: list[dict] = []
    for contact in structured.contacts:
        payload = contact.model_dump()
        payload["phone"] = normalize_phone(payload.get("phone"))
        payload["email"] = normalize_email(payload.get("email"))
        payload.setdefault("confidence", ocr_result.get("confidence"))
        contacts.append(payload)
    return {
        "contacts": contacts,
        "meta": {
            "ocr_confidence": ocr_result.get("confidence"),
            "ocr_text": ocr_result.get("text"),
        },
    }
