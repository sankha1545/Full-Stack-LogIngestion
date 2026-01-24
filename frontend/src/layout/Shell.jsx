import { useState } from "react";
import Sidebar from "../components/Sidebar";
import WebCLI from "../components/WebCLI/WebCLI";

export default function Shell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="h-14 flex justify-between items-center px-4 bg-slate-900 border-b border-slate-800">
          <h1 className="font-bold">LogScope</h1>
          <button
            onClick={() => setOpen(true)}
            className="bg-indigo-600 px-3 py-1 rounded text-sm"
          >
            Open Terminal
          </button>
        </header>

        <WebCLI open={open} onClose={() => setOpen(false)} />

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
