import React from "react";
import type { ContactSummary } from "./ContactList";

interface ContactCardProps {
  contact: ContactSummary;
  children?: React.ReactNode;
}

export function ContactCard({ contact, children }: ContactCardProps) {
  const { name, email, phone, company, notes, extra } = contact;
  const extraEntries = Object.entries(extra ?? {}).filter(([, value]) => {
    if (value === null || value === undefined) return false;
    const normalized = String(value).trim();
    return normalized.length > 0 && normalized.toLowerCase() !== "null";
  });

  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-800/80 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-50 to-slate-300 group-hover:from-cyan-300 group-hover:to-emerald-300 transition-all">
            {name ?? "Unknown Contact"}
          </h2>
        </div>
        {company && (
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <span>🏢</span>
            <span>{company}</span>
          </div>
        )}
        <div className="space-y-2 pt-2">
          {email && (
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <span className="text-cyan-400">✉️</span>
              <span className="font-medium text-slate-300">Email:</span>
              <span className="text-slate-400">{email}</span>
            </p>
          )}
          {phone && (
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400">📞</span>
              <span className="font-medium text-slate-300">Phone:</span>
              <span className="text-slate-400">{phone}</span>
            </p>
          )}
          {notes && (
            <p className="text-sm text-slate-500 flex items-start gap-2 pt-2">
              <span className="text-yellow-400">📝</span>
              <span className="flex-1">
                <span className="font-medium text-slate-400">Notes:</span> {notes}
              </span>
            </p>
          )}
        </div>
        {extraEntries.length > 0 && (
          <dl className="mt-4 space-y-2 rounded-lg bg-slate-900/50 p-3 text-xs border border-slate-700/30">
            {extraEntries.map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <dt className="min-w-[80px] font-semibold text-slate-400">{label}</dt>
                <dd className="flex-1 text-slate-500">{String(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {children && <div className="mt-5 flex items-center justify-end pt-4 border-t border-slate-700/30">{children}</div>}
    </article>
  );
}
