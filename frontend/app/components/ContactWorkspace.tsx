"use client";

import React, { useMemo, useState } from "react";

import { ContactList, ContactSummary } from "./ContactList";
import { ErrorCallout } from "./ErrorCallout";
import { LoadingOverlay } from "./LoadingOverlay";
import { UploadCard } from "./UploadCard";
import { useContacts } from "../../hooks/useContacts";
import {
  ContactPayload,
  extractContacts,
  improveContacts,
  deduplicateContacts,
} from "../../lib/client";

const createClientId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

export function ContactWorkspace() {
  const { contacts, replaceContacts } = useContacts();
  const [isExtracting, setIsExtracting] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isDeduping, setIsDeduping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dedupeInfo, setDedupeInfo] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    ocr_confidence?: number | null;
    ocr_text?: string | null;
  } | null>(null);

  const handleSelectFile = async (files: File[]) => {
    console.log('=== EXTRACTION STARTED ===');
    console.log('Processing', files.length, 'file(s)');
    setError(null);
    setDedupeInfo(null);
    setIsExtracting(true);
    
    try {
      const allContacts: ContactSummary[] = [];
      const { searchContacts } = await import('../../lib/client');
      let duplicateCount = 0;
      
      // Process each file sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Processing file ${i + 1}/${files.length}:`, file.name);
        
        try {
          const response = await extractContacts(file);
          console.log('Response received:', response);
          
          const fileContacts: ContactSummary[] = (response.contacts ?? []).map((contact) => ({
            id: createClientId(),
            name: contact.name ?? null,
            phone: contact.phone ?? null,
            email: contact.email ?? null,
            company: contact.company ?? null,
            notes: contact.notes ?? null,
            confidence: contact.confidence ?? null,
            extra: contact.extra ?? null,
          }));
          
          console.log('Mapped contacts count:', fileContacts.length);
          
          // Check for duplicates in database
          for (const newContact of fileContacts) {
            if (newContact.email) {
              try {
                const emailResults = await searchContacts(newContact.email);
                if (emailResults.total > 0) {
                  duplicateCount++;
                }
              } catch (e) {
                console.error('Database search failed:', e);
              }
            }
          }
          
          allContacts.push(...fileContacts);
          
          // Store last file's meta
          if (i === files.length - 1) {
            setMeta(response.meta ?? null);
          }
        } catch (err) {
          console.error(`Failed to process file ${file.name}:`, err);
          // Continue processing other files
        }
      }
      
      console.log('Total contacts extracted:', allContacts.length);
      replaceContacts(allContacts);
      
      // Show duplicate warning if found
      if (duplicateCount > 0) {
        setDedupeInfo(`⚠️ Found ${duplicateCount} contact${duplicateCount !== 1 ? 's' : ''} that may already exist in database! Visit the database page to merge duplicates.`);
      } else if (files.length > 1) {
        setDedupeInfo(`✅ Successfully extracted ${allContacts.length} contact${allContacts.length !== 1 ? 's' : ''} from ${files.length} image${files.length !== 1 ? 's' : ''}!`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to extract contacts.";
      setError(message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleImprove = async () => {
    setError(null);
    setIsImproving(true);
    try {
      const payload: ContactPayload[] = contacts.map(({ id, ...rest }) => ({
        name: rest.name ?? null,
        phone: rest.phone ?? null,
        email: rest.email ?? null,
        company: rest.company ?? null,
        notes: rest.notes ?? null,
        confidence: rest.confidence ?? null,
        extra: (rest.extra ?? null) as Record<string, unknown> | null,
      }));

      const response = await improveContacts(payload);
      const improved: ContactSummary[] = (response.contacts ?? []).map((contact) => ({
        id: createClientId(),
        name: contact.name ?? null,
        phone: contact.phone ?? null,
        email: contact.email ?? null,
        company: contact.company ?? null,
        notes: contact.notes ?? null,
        confidence: contact.confidence ?? null,
        extra: contact.extra ?? null,
      }));
      replaceContacts(improved);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to improve contacts.";
      setError(message);
    } finally {
      setIsImproving(false);
    }
  };

  const handleDedupe = async () => {
    setError(null);
    setDedupeInfo(null);
    setIsDeduping(true);
    try {
      const payload: ContactPayload[] = contacts.map(({ id, ...rest }) => ({
        name: rest.name ?? null,
        phone: rest.phone ?? null,
        email: rest.email ?? null,
        company: rest.company ?? null,
        notes: rest.notes ?? null,
        confidence: rest.confidence ?? null,
        extra: (rest.extra ?? null) as Record<string, unknown> | null,
      }));

      const response = await deduplicateContacts(payload);
      const deduped: ContactSummary[] = (response.contacts ?? []).map((contact) => ({
        id: createClientId(),
        name: contact.name ?? null,
        phone: contact.phone ?? null,
        email: contact.email ?? null,
        company: contact.company ?? null,
        notes: contact.notes ?? null,
        confidence: contact.confidence ?? null,
        extra: contact.extra ?? null,
      }));
      replaceContacts(deduped);
      
      if (response.meta) {
        const { original_count, merged_count, duplicates_found } = response.meta;
        setDedupeInfo(`✨ Merged ${duplicates_found} duplicate${duplicates_found !== 1 ? 's' : ''} (${original_count} → ${merged_count} contacts)`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to deduplicate contacts.";
      setError(message);
    } finally {
      setIsDeduping(false);
    }
  };

  return (
    <div className="relative flex w-full max-w-5xl flex-col items-center gap-12">
      <div className="text-center space-y-4">
        <div className="inline-block animate-fade-in">
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-2xl">
            ConExt.AI
          </h1>
          <div className="h-1 w-32 mx-auto mt-3 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full opacity-60"></div>
        </div>
        <p className="text-slate-400 text-base font-medium">🚀 Smart Contact Extraction with AI Intelligence</p>
        <div className="mt-6">
          <a
            href="/database"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-300 shadow-lg transition-all hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-cyan-500/20 hover:scale-105"
          >
            <span>📚</span>
            <span>View Database</span>
          </a>
        </div>
      </div>
      <UploadCard onSelectFile={handleSelectFile} isLoading={isExtracting} />
      {error && <ErrorCallout message={error} />}
      {dedupeInfo && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          dedupeInfo.startsWith('⚠️') 
            ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300' 
            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
        }`}>
          {dedupeInfo}
        </div>
      )}
      {contacts.length > 0 && (
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            type="button"
            onClick={handleImprove}
            disabled={isImproving || isDeduping}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <span>🔧</span>
            <span>{isImproving ? "Improving..." : "Improve Data"}</span>
          </button>
          {contacts.length > 1 && (
            <button
              type="button"
              onClick={handleDedupe}
              disabled={isImproving || isDeduping}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              <span>🔗</span>
              <span>{isDeduping ? "Merging..." : "Merge Duplicates"}</span>
            </button>
          )}
        </div>
      )}
      {meta?.ocr_text && (
        <details className="w-full max-w-4xl rounded-lg border border-slate-800/60 bg-slate-900/40 p-4 text-xs text-slate-400">
          <summary className="cursor-pointer text-slate-200">View OCR raw text</summary>
          <pre className="mt-3 whitespace-pre-wrap break-words text-slate-400">{meta.ocr_text}</pre>
        </details>
      )}
      <ContactList contacts={contacts} />
      <LoadingOverlay isVisible={isExtracting || isImproving || isDeduping} label="Processing with AI" />
    </div>
  );
}
