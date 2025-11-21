import React from "react";

import { ContactWorkspace } from "./components/ContactWorkspace";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 py-16">
      <div className="flex-1 flex items-center">
        <ContactWorkspace />
      </div>
      <footer className="mt-16 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
        <p className="font-medium text-slate-300">Azhar Tula</p>
        <p className="mt-1">
          <a href="mailto:azhartula125@gmail.com" className="hover:text-cyan-400 transition">
            azhartula125@gmail.com
          </a>
        </p>
        <p className="mt-1">
          <a href="tel:+923481892160" className="hover:text-cyan-400 transition">
            +92 348 1892160
          </a>
        </p>
      </footer>
    </main>
  );
}
