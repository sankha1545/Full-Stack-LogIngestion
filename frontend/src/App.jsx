import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";


export default function App() {
  const [theme, setTheme] = useState("dark");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    console.log("API URL:", import.meta.env.VITE_API_URL);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="flex min-h-screen overflow-x-hidden transition-colors bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* Mobile sidebar overlay */}
      <div className="lg:hidden">
        <Sidebar mobile open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 w-full">

        {/* Header */}
    <header className="flex items-center gap-3 px-3 py-3 bg-white border-b border-slate-300 dark:border-slate-800 dark:bg-slate-900 sm:px-6 sm:py-4">

 
  <button
    onClick={() => setSidebarOpen(true)}
    className="flex-shrink-0 px-2 py-1 rounded lg:hidden bg-slate-200 dark:bg-slate-800"
  >
    ☰
  </button>

  {/* Title */}
  <div className="flex-1 min-w-0">
    <h1 className="text-lg font-bold truncate sm:text-xl">LogScope</h1>
    <p className="text-xs truncate sm:text-sm text-slate-600 dark:text-slate-400">
      Real-time Log Ingestion & Querying
    </p>
  </div>

  {/* Right actions */}
  <div className="flex items-center gap-2 sm:gap-3">
    <button
      onClick={() => setTerminalOpen(true)}
      className="px-2 py-1 text-xs text-white transition bg-indigo-600 rounded sm:px-3 sm:text-sm hover:bg-indigo-700"
    >
      Terminal
    </button>

    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-2 py-1 text-xs rounded sm:px-3 bg-slate-200 dark:bg-slate-800 sm:text-sm"
    >
      {theme === "dark" ? "☀" : "🌙"}
    </button>
  </div>
</header>


        {/* Page content */}
        <main className="flex-1 w-full p-3 overflow-x-hidden overflow-y-auto sm:p-6">
          <Outlet />
        </main>
      </div>

    
     
    </div>
  );
}
