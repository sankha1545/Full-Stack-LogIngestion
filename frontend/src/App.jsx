import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

import Sidebar from "./components/Sidebar";
import ConfirmLogoutModal from "@/components/ui/ConfirmLogoutModal";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Menu, LogOut, User, Settings } from "lucide-react";

/* NEW — GLOBAL TOAST SYSTEM */
import { Toaster } from "react-hot-toast";

export default function App() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  /* =====================================================
     SAFE LOGOUT (Context-Controlled)
  ===================================================== */

  const handleLogout = async () => {
    try {
      await logout(); // clears token, user, refresh cookie
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  /* =====================================================
     ESC CLOSE (MOBILE SIDEBAR)
  ===================================================== */

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  /* =====================================================
     HARD SAFETY CHECK
     Prevents ghost session UI if token expires
     (important after password change / forced logout)
  ===================================================== */

  useEffect(() => {
    if (user === null) {
      // user explicitly removed → redirect to login
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return (
    <>
      {/* ================= GLOBAL TOASTS ================= */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#0f172a",
            border: "1px solid #e2e8f0",
          },
        }}
      />

      <div className="flex min-h-screen bg-slate-50 text-slate-900">

        {/* ================= DESKTOP SIDEBAR ================= */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* ================= MAIN ================= */}
        <div className="flex flex-col flex-1 w-full">

          {/* ================= HEADER ================= */}
          <header className="sticky top-0 z-40 flex items-center h-16 gap-3 px-4 bg-white border-b sm:px-6">

            {/* Mobile sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-slate-100 focus-visible:ring-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Brand */}
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold tracking-tight">
                LogScope
              </span>
              <span className="text-xs text-slate-500">
                Real-time log ingestion & querying
              </span>
            </div>

            <div className="flex-1" />

            {/* ================= ACCOUNT DROPDOWN ================= */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 bg-transparent hover:bg-slate-100 focus-visible:ring-0"
                >
                  <User className="w-4 h-4" />
                  {user?.email || "Account"}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="bg-white border shadow-lg w-52"
              >
                <DropdownMenuItem
                  onClick={() => navigate("/settings")}
                  className="cursor-pointer focus:bg-slate-100"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile settings
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setLogoutOpen(true)}
                  className="text-red-600 cursor-pointer focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* ================= CONTENT ================= */}
          <main className="flex-1 p-4 overflow-auto bg-slate-100 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>

        {/* ================= MOBILE SIDEBAR ================= */}
        <Sidebar
          mobile
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ================= LOGOUT MODAL ================= */}
        <ConfirmLogoutModal
          open={logoutOpen}
          onOpenChange={setLogoutOpen}
          onConfirm={handleLogout}
        />
      </div>
    </>
  );
}
