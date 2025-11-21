import React from "react";

interface FieldDiffProps {
  label: string;
  oldValue?: string | null;
  newValue?: string | null;
}

export function FieldDiff({ label, oldValue, newValue }: FieldDiffProps) {
  if (oldValue === newValue) return null;
  
  const hasChange = oldValue !== newValue;
  
  return (
    <div className="space-y-1 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
      <p className="text-xs font-semibold text-amber-300">{label} Changed</p>
      {oldValue && (
        <p className="text-xs text-slate-400 line-through">
          Old: {oldValue}
        </p>
      )}
      {newValue && (
        <p className="text-xs font-medium text-cyan-300">
          New: {newValue}
        </p>
      )}
    </div>
  );
}
