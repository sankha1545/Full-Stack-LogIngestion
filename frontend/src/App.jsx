import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

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

export default function App() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside className="hidden bg-white border-r lg:flex lg:w-72 lg:flex-col">
        <Sidebar />
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex flex-col flex-1 w-full">
        {/* ================= HEADER ================= */}
        <header className="sticky top-0 z-40 flex items-center h-16 gap-3 px-4 bg-white border-b sm:px-6">
          {/* Mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
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
                variant="outline"
                size="sm"
                className="gap-2 bg-white border-slate-300"
              >
                <User className="w-4 h-4 " />
                Account
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="bg-white w-52 border-slate-200"
            >
              <DropdownMenuItem
                onClick={() => navigate("/settings")}
                className="cursor-pointer"
              >
                <Settings className="w-4 h-4 mr-2" />
                Profile settings
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setLogoutOpen(true)}
                className="text-red-600 cursor-pointer focus:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* ================= CONTENT ================= */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-100">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ================= MOBILE SIDEBAR ================= */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute top-0 left-0 h-full bg-white shadow-xl w-72">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ================= LOGOUT MODAL ================= */}
      <ConfirmLogoutModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </div>
  );
}
