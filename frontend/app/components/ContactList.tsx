import React from "react";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ContactCard } from "./ContactCard";

export interface ContactSummary {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  confidence?: number | null;
  notes?: string | null;
  extra?: Record<string, unknown> | null;
}

interface ContactListProps {
  contacts: ContactSummary[];
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export function ContactList({ contacts, onDelete, showDelete = false }: ContactListProps) {
  if (!contacts.length) {
    return (
      <p className="text-sm text-slate-400">
        No contacts extracted yet. Upload a card to see results.
      </p>
    );
  }

  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
      {contacts.map((contact) => (
        <div key={contact.id} className="relative">
          <ContactCard contact={contact}>
            <ConfidenceBadge value={contact.confidence} />
          </ContactCard>
          {showDelete && onDelete && (
            <button
              onClick={() => onDelete(contact.id)}
              className="absolute top-3 right-3 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-500/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-rose-500/50 opacity-0 group-hover:opacity-100"
              title="Delete contact"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
