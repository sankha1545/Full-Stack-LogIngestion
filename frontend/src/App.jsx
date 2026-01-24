import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import WebCLI from "./components/WebCLI/WebCLI";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [terminalOpen, setTerminalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">LogScope</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Real-time Log Ingestion & Querying
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* OPEN TERMINAL */}
            <button
              onClick={() => setTerminalOpen(true)}
              className="px-3 py-1 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
            >
              Open Terminal
            </button>

            {/* THEME TOGGLE */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-sm"
            >
              {theme === "dark" ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* GLOBAL WEB TERMINAL */}
      <WebCLI open={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </div>
  );
}
