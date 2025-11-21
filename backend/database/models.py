"""
Database models for contact storage.
"""

from datetime import datetime
from typing import Any

from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Index
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=True)
    phone = Column(String, index=True, nullable=True)
    email = Column(String, index=True, nullable=True)
    company = Column(String, index=True, nullable=True)
    notes = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    extra = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Composite indexes for common queries
    __table_args__ = (
        Index('ix_name_company', 'name', 'company'),
        Index('ix_email_phone', 'email', 'phone'),
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "company": self.company,
            "notes": self.notes,
            "confidence": self.confidence,
            "extra": self.extra,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
