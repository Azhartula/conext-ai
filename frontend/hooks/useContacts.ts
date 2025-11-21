import { useState, useCallback } from "react";
import type { ContactSummary } from "../app/components/ContactList";

export function useContacts(initialContacts: ContactSummary[] = []) {
  const [contacts, setContacts] = useState<ContactSummary[]>(initialContacts);

  const addContacts = useCallback((incoming: ContactSummary[]) => {
    setContacts((prev) => [...incoming, ...prev]);
  }, []);

  const replaceContacts = useCallback((next: ContactSummary[]) => {
    setContacts(next);
  }, []);

  const clearContacts = useCallback(() => {
    setContacts([]);
  }, []);

  return {
    contacts,
    addContacts,
    replaceContacts,
    clearContacts,
  };
}
