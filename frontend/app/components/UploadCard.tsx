import React from "react";

interface UploadCardProps {
  onSelectFile?: (files: File[]) => void;
  isLoading?: boolean;
}

export function UploadCard({ onSelectFile, isLoading = false }: UploadCardProps) {
  return (
    <div className="w-full max-w-xl rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-800/90 p-10 shadow-2xl backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:shadow-cyan-500/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">🎴</div>
        <div>
          <p className="text-2xl font-bold text-slate-100">Upload Business Cards</p>
          <p className="text-xs text-slate-500">Drag & drop or click to upload</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-400 leading-relaxed">
        ✨ AI-powered extraction with intelligent field inference, auto-correction, and smart deduplication.
        Upload single or multiple cards at once.
      </p>
      <button
        className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-400 px-8 py-4 text-base font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        type="button"
        disabled={isLoading}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.multiple = true;
          input.onchange = () => {
            const files = Array.from(input.files || []);
            if (files.length > 0 && onSelectFile) onSelectFile(files);
          };
          input.click();
        }}
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⚡</span>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>📤</span>
            <span>Choose Images</span>
          </>
        )}
      </button>
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1">✓ PNG, JPEG</span>
        <span className="flex items-center gap-1">✓ OCR Powered</span>
        <span className="flex items-center gap-1">✓ AI Enhanced</span>
      </div>
    </div>
  );
}
