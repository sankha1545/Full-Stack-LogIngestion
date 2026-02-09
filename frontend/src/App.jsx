import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import ConfirmLogoutModal from "@/components/ui/ConfirmLogoutModal";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const navigate = useNavigate();

  /* ----------------------------------------
     Theme
  ---------------------------------------- */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  /* ----------------------------------------
     Logout
  ---------------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b dark:bg-slate-900 dark:border-slate-800">
          <div className="flex-1">
            <h1 className="text-lg font-bold">LogScope</h1>
            <p className="text-xs text-slate-500">
              Real-time Log Ingestion & Querying
            </p>
          </div>

          <button
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
            className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800"
          >
            {theme === "dark" ? "☀" : "🌙"}
          </button>

          <button
            onClick={() => setLogoutOpen(true)}
            className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>

      {/* Logout confirmation */}
      <ConfirmLogoutModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </div>
  );
}
