import React from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
  label?: string;
}

export function LoadingOverlay({ isVisible, label }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 px-6 py-5 shadow-xl">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        <p className="text-sm font-medium text-slate-200">{label ?? "Working..."}</p>
      </div>
    </div>
  );
}
