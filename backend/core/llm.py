from __future__ import annotations

import asyncio
import importlib
import importlib.util
import json
from functools import lru_cache
from typing import Any

from pydantic import BaseModel, Field

from backend.core.config import get_settings

_SPEC = importlib.util.find_spec("google.generativeai")
if _SPEC:  # pragma: no branch - simple import guard
    genai = importlib.import_module("google.generativeai")
else:  # pragma: no cover
    genai = None

_MODEL_NAME = "models/gemini-2.0-flash"


class Contact(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    company: str | None = None
    notes: str | None = None
    confidence: float | None = Field(default=None, ge=0, le=1)
    extra: dict[str, Any] | None = None


class ContactResponse(BaseModel):
    contacts: list[Contact] = Field(default_factory=list)


_STRUCTURE_PROMPT = """You are a contact card extraction assistant. Given OCR text, return ONLY valid JSON matching this schema:
{
  "contacts": [
    {
      "name": string | null,
      "phone": string | null,
      "email": string | null,
      "company": string | null,
      "notes": string | null,
      "confidence": number | null,
      "extra": object | null
    }
  ]
}
Guidelines:
- Do not include markdown or commentary.
- Normalize phone numbers to E.164 format when you are confident; otherwise leave as null.
- Provide confidence between 0 and 1 when possible.
- **INTELLIGENT INFERENCE**: Use context clues to infer job title, department, or role. If you see text like "VP", "Director", "Manager", "Engineer", extract to extra.job_title. If you see department names like "Sales", "Engineering", "HR", extract to extra.department.
- **CONTEXTUAL ENRICHMENT**: If company name suggests industry (e.g., "Tech Solutions" → tech industry), add extra.inferred_industry.
- Use the extra object for any remaining fields (e.g., job title, address, website, LinkedIn).

OCR text:
"""

_IMPROVE_PROMPT = """You are improving previously extracted contact data. Return ONLY valid JSON matching this exact schema:
{{
  "contacts": [
    {{
      "name": string | null,
      "phone": string | null,
      "email": string | null,
      "company": string | null,
      "notes": string | null,
      "confidence": number | null,
      "extra": object | null
    }}
  ]
}}

Existing contacts (JSON):
{contacts_json}

Additional guidance: {instructions}

Rules:
- Do not include markdown or commentary.
- Fix obvious OCR mistakes (e.g., "0" misread as "O", "1" as "l").
- **SMART INFERENCE**: Infer missing job title, department, or industry from context. Look for professional titles, company type, or role indicators.
- **ENRICHMENT**: If you can deduce additional info (social media handles, website from email domain), add to extra object.
- Keep phone/email formatting consistent.
- Preserve any notes or extra data if still relevant.
- MUST wrap the array in a "contacts" field.
"""


def _strip_code_fence(payload: str) -> str:
    trimmed = payload.strip()
    if not trimmed.startswith("```"):
        return trimmed
    segments = trimmed.split("```")
    if len(segments) < 3:
        return trimmed
    content = segments[1]
    if content.lower().startswith("json"):
        content = content[4:]
    return content.strip()


def _extract_response_text(response: Any) -> str:
    candidates = getattr(response, "candidates", []) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", []) if content else []
        for part in parts:
            text = getattr(part, "text", None)
            if text:
                return text
    raise ValueError("LLM response did not contain text output")


@lru_cache(maxsize=1)
def _get_model() -> Any:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    if genai is None:  # pragma: no cover - runtime guard
        raise RuntimeError(
            "google-generativeai is not installed. Install it or choose another LLM provider."
        )
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(_MODEL_NAME)


async def _invoke_model(prompt: str) -> ContactResponse:
    model = _get_model()
    response = await asyncio.to_thread(
        model.generate_content,
        prompt,
        generation_config={"response_mime_type": "application/json"},
    )
    payload = _strip_code_fence(_extract_response_text(response))
    data = json.loads(payload)
    return ContactResponse.model_validate(data)


async def structure_contacts(ocr_text: str) -> ContactResponse:
    if not ocr_text.strip():
        return ContactResponse()
    prompt = f"{_STRUCTURE_PROMPT}{ocr_text}\n"
    return await _invoke_model(prompt)


async def improve_contacts(
    contacts: list[dict[str, Any]],
    instructions: str | None = None,
) -> ContactResponse:
    contacts_json = json.dumps(contacts, ensure_ascii=False, indent=2)
    guidance = instructions.strip() if instructions else "None"
    prompt = _IMPROVE_PROMPT.format(contacts_json=contacts_json, instructions=guidance)
    return await _invoke_model(prompt)


_DEDUPE_PROMPT = """You are a contact deduplication expert. Analyze the contacts and merge ONLY true duplicates of the same person.

Contacts (JSON):
{contacts_json}

CRITICAL RULES:

1. **SAME PERSON - MUST MERGE if ALL of these are true:**
   - Same name (exact or very close variation like "John Smith" vs "J. Smith")
   - AND same phone number OR same email
   
2. **DIFFERENT PEOPLE - DO NOT MERGE even if they share contact info:**
   - Different names with same phone/email = DIFFERENT people from same company/household
   - Example: "Olivia Wilson" and "Mariana Anderson" with same email = 2 SEPARATE contacts (coworkers sharing company contact)
   - Example: "John Smith" and "Jane Smith" with same phone = 2 SEPARATE contacts (family/household)

3. **MERGING STRATEGY (only when merging same person):**
   - Take the MOST COMPLETE value for each field
   - Combine all unique extra fields (job_title, address, website, etc.)
   - Use the HIGHEST confidence score
   - Do NOT add any merge notes

4. **EXAMPLES:**
   ✅ MERGE: "John Smith" (+11234567890) + "John Smith" (+11234567890) → Same person
   ✅ MERGE: "John Smith" (john@acme.com) + "J. Smith" (john@acme.com) → Same person, name variation
   ❌ DON'T MERGE: "Olivia Wilson" (hello@company.com) + "Mariana Anderson" (hello@company.com) → Different people, same company email
   ❌ DON'T MERGE: "John Smith" (+1234567890) + "Jane Smith" (+1234567890) → Different people, shared phone

BE CAREFUL: Shared contact information does NOT mean same person. You MUST check the NAME first.

Return ONLY valid JSON matching this schema:
{{
  "contacts": [
    {{
      "name": string | null,
      "phone": string | null,
      "email": string | null,
      "company": string | null,
      "notes": string | null,
      "confidence": number | null,
      "extra": object | null
    }}
  ]
}}
"""


async def deduplicate_contacts(contacts: list[dict[str, Any]]) -> ContactResponse:
    """Use LLM to detect and merge duplicate contacts based on semantic similarity."""
    if len(contacts) < 2:
        return ContactResponse(contacts=[Contact.model_validate(c) for c in contacts])
    
    contacts_json = json.dumps(contacts, ensure_ascii=False, indent=2)
    prompt = _DEDUPE_PROMPT.format(contacts_json=contacts_json)
    return await _invoke_model(prompt)
