"""
Routes for contact database operations.
"""

from typing import Any

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.connection import get_db
from backend.database.operations import (
    create_contact,
    get_contact_by_id,
    search_contacts,
    get_all_contacts,
    get_contact_by_name,
    update_contact,
    delete_contact,
    get_contact_count,
)

router = APIRouter()


@router.post("/")
async def save_contact(
    contact_data: dict[str, Any],
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """Save a new contact to the database."""
    try:
        contact = await create_contact(db, contact_data)
        return JSONResponse(
            status_code=201,
            content={"contact": contact.to_dict(), "message": "Contact saved successfully"},
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to save contact: {str(e)}"},
        )


@router.get("/")
async def list_contacts(
    query: str | None = Query(None, description="Search query for name/email/phone/company"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """List all contacts with optional search."""
    try:
        if query:
            contacts = await search_contacts(db, query, limit, offset)
            total = await get_contact_count(db, query)
        else:
            contacts = await get_all_contacts(db, limit, offset)
            total = await get_contact_count(db)
        
        return JSONResponse(
            content={
                "contacts": [c.to_dict() for c in contacts],
                "total": total,
                "limit": limit,
                "offset": offset,
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to list contacts: {str(e)}"},
        )


@router.get("/{contact_id}")
async def get_contact(
    contact_id: int,
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """Get a specific contact by ID."""
    contact = await get_contact_by_id(db, contact_id)
    if not contact:
        return JSONResponse(
            status_code=404,
            content={"error": "Contact not found"},
        )
    return JSONResponse(content={"contact": contact.to_dict()})


@router.get("/search/by-name")
async def search_by_name(
    name: str = Query(..., description="Name to search for"),
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """Get all contact details by searching name."""
    try:
        contacts = await get_contact_by_name(db, name)
        return JSONResponse(
            content={
                "contacts": [c.to_dict() for c in contacts],
                "count": len(contacts),
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Search failed: {str(e)}"},
        )


@router.put("/{contact_id}")
async def update_contact_route(
    contact_id: int,
    contact_data: dict[str, Any],
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """Update a contact."""
    contact = await update_contact(db, contact_id, contact_data)
    if not contact:
        return JSONResponse(
            status_code=404,
            content={"error": "Contact not found"},
        )
    return JSONResponse(content={"contact": contact.to_dict()})


@router.delete("/{contact_id}")
async def delete_contact_route(
    contact_id: int,
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    """Delete a contact."""
    success = await delete_contact(db, contact_id)
    if not success:
        return JSONResponse(
            status_code=404,
            content={"error": "Contact not found"},
        )
    return JSONResponse(content={"message": "Contact deleted successfully"})
