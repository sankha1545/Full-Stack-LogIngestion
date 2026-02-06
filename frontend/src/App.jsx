import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sidebar mobile open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 w-full">

        {/* Header */}
        <header className="flex items-center gap-3 px-3 py-3 bg-white border-b dark:bg-slate-900 dark:border-slate-800 sm:px-6">

          <button
            onClick={() => setSidebarOpen(true)}
            className="px-2 py-1 rounded lg:hidden bg-slate-200 dark:bg-slate-800"
          >
            ☰
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-bold">LogScope</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Real-time Log Ingestion & Querying
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800"
            >
              {theme === "dark" ? "☀" : "🌙"}
            </button>

            <button
              onClick={logout}
              className="px-3 py-1 text-sm text-white bg-red-600 rounded"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
