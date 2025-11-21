"""
Database operations for contacts.
"""

from typing import Any

from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.models import Contact


async def create_contact(db: AsyncSession, contact_data: dict[str, Any]) -> Contact:
    """Create a new contact in the database."""
    contact = Contact(**contact_data)
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return contact


async def get_contact_by_id(db: AsyncSession, contact_id: int) -> Contact | None:
    """Get contact by ID."""
    result = await db.execute(select(Contact).where(Contact.id == contact_id))
    return result.scalar_one_or_none()


async def search_contacts(
    db: AsyncSession,
    query: str | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[Contact]:
    """Search contacts by name, email, phone, or company."""
    stmt = select(Contact)
    
    if query:
        search_pattern = f"%{query}%"
        stmt = stmt.where(
            or_(
                Contact.name.ilike(search_pattern),
                Contact.email.ilike(search_pattern),
                Contact.phone.ilike(search_pattern),
                Contact.company.ilike(search_pattern),
            )
        )
    
    stmt = stmt.order_by(Contact.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_all_contacts(
    db: AsyncSession,
    limit: int = 100,
    offset: int = 0,
) -> list[Contact]:
    """Get all contacts with pagination."""
    stmt = select(Contact).order_by(Contact.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_contact_by_name(db: AsyncSession, name: str) -> list[Contact]:
    """Get all contacts matching the name (case-insensitive)."""
    stmt = select(Contact).where(Contact.name.ilike(f"%{name}%"))
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_contact(
    db: AsyncSession,
    contact_id: int,
    contact_data: dict[str, Any],
) -> Contact | None:
    """Update a contact."""
    contact = await get_contact_by_id(db, contact_id)
    if not contact:
        return None
    
    for key, value in contact_data.items():
        if hasattr(contact, key):
            setattr(contact, key, value)
    
    await db.commit()
    await db.refresh(contact)
    return contact


async def delete_contact(db: AsyncSession, contact_id: int) -> bool:
    """Delete a contact."""
    contact = await get_contact_by_id(db, contact_id)
    if not contact:
        return False
    
    await db.delete(contact)
    await db.commit()
    return True


async def get_contact_count(db: AsyncSession, query: str | None = None) -> int:
    """Get total count of contacts matching query."""
    stmt = select(func.count(Contact.id))
    
    if query:
        search_pattern = f"%{query}%"
        stmt = stmt.where(
            or_(
                Contact.name.ilike(search_pattern),
                Contact.email.ilike(search_pattern),
                Contact.phone.ilike(search_pattern),
                Contact.company.ilike(search_pattern),
            )
        )
    
    result = await db.execute(stmt)
    return result.scalar() or 0
