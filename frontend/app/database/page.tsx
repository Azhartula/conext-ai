"use client";

import React, { useState } from "react";
import { SearchBar } from "../components/SearchBar";
import { ContactList, ContactSummary } from "../components/ContactList";
import { ErrorCallout } from "../components/ErrorCallout";
import { searchContacts, DatabaseContact, deduplicateContacts, ContactPayload } from "../../lib/client";

export default function DatabasePage() {
  const [contacts, setContacts] = useState<ContactSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInfo, setSearchInfo] = useState<string | null>(null);
  const [dedupeInfo, setDedupeInfo] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");

  const handleSearch = async (query: string) => {
    setError(null);
    setSearchInfo(null);
    setIsSearching(true);
    setLastQuery(query);

    try {
      const response = await searchContacts(query);
      const mappedContacts: ContactSummary[] = response.contacts.map((c: DatabaseContact) => ({
        id: c.id.toString(),
        name: c.name,
        phone: c.phone,
        email: c.email,
        company: c.company,
        notes: c.notes,
        confidence: c.confidence,
        extra: c.extra,
      }));
      
      setContacts(mappedContacts);
      setSearchInfo(
        query
          ? `Found ${response.total} contact${response.total !== 1 ? 's' : ''} matching "${query}"`
          : `Showing ${response.total} contact${response.total !== 1 ? 's' : ''} from database`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Search failed";
      setError(message);
    } finally {
      setIsSearching(false);
    }
  };

  // Load all contacts on mount
  React.useEffect(() => {
    handleSearch("");
  }, []);

  const handleMergeDuplicates = async () => {
    if (!window.confirm('Merge all duplicate contacts? This will consolidate matching contacts into single entries.')) {
      return;
    }

    setError(null);
    setDedupeInfo(null);
    setIsMerging(true);
    
    try {
      // Get all contact IDs before merge
      const originalIds = contacts.map(c => parseInt(c.id));
      
      const payload: ContactPayload[] = contacts.map((c) => ({
        name: c.name ?? null,
        phone: c.phone ?? null,
        email: c.email ?? null,
        company: c.company ?? null,
        notes: c.notes ?? null,
        confidence: c.confidence ?? null,
        extra: (c.extra ?? null) as Record<string, unknown> | null,
      }));

      // Get merged contacts from dedupe API
      const response = await deduplicateContacts(payload);
      
      if (response.meta && response.meta.duplicates_found > 0) {
        const { original_count, merged_count, duplicates_found } = response.meta;
        
        // Delete all original contacts from database
        for (const id of originalIds) {
          try {
            await fetch(`http://localhost:8000/contacts/${id}`, {
              method: 'DELETE',
            });
          } catch (e) {
            console.error(`Failed to delete contact ${id}:`, e);
          }
        }
        
        // Save merged contacts back to database
        for (const mergedContact of response.contacts) {
          try {
            await fetch('http://localhost:8000/contacts/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(mergedContact),
            });
          } catch (e) {
            console.error('Failed to save merged contact:', e);
          }
        }
        
        setDedupeInfo(`✨ Successfully merged ${duplicates_found} duplicate${duplicates_found !== 1 ? 's' : ''} (${original_count} → ${merged_count} contacts)`);
        
        // Reload contacts from database
        await handleSearch("");
      } else {
        setDedupeInfo(`✅ No duplicates found! All contacts are unique.`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to merge duplicates.";
      setError(message);
    } finally {
      setIsMerging(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Delete this contact permanently?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/contacts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      // Reload the list
      await handleSearch(lastQuery);
      
      setDedupeInfo("✅ Contact deleted successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setDedupeInfo(null);
      }, 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete contact.";
      setError(message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16 gap-10">
      <div className="text-center space-y-4">
        <div className="inline-block">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-2xl">
            Contact Database
          </h1>
          <div className="h-1 w-40 mx-auto mt-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full opacity-60"></div>
        </div>
        <p className="text-slate-400 text-base font-medium">🔍 Search and browse all saved contacts</p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-300 shadow-lg transition-all hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-cyan-500/20 hover:scale-105"
          >
            <span>←</span>
            <span>Back to Home</span>
          </a>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} isSearching={isSearching} />

      {contacts.length > 1 && (
        <button
          type="button"
          onClick={handleMergeDuplicates}
          disabled={isMerging}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          <span>🔗</span>
          <span>{isMerging ? "Merging..." : "Merge Duplicates"}</span>
        </button>
      )}

      {error && <ErrorCallout message={error} />}
      
      {dedupeInfo && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {dedupeInfo}
        </div>
      )}
      
      {searchInfo && (
        <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
          {searchInfo}
        </div>
      )}

      {contacts.length > 0 ? (
        <ContactList contacts={contacts} onDelete={handleDeleteContact} showDelete={true} />
      ) : (
        !isSearching && !error && (
          <p className="text-slate-500 text-sm">No contacts found. Start by extracting contacts from business cards!</p>
        )
      )}
    </main>
  );
}
