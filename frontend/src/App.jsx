import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
import { Menu, LogOut, User, Settings, BellDot, Sparkles } from "lucide-react";
import { getSocket } from "@/services/socket";

const PAGE_META = {
  "/dashboard": {
    title: "Overview",
    subtitle: "A clear snapshot of application health, activity, and actions.",
  },
  "/applications": {
    title: "Applications",
    subtitle: "Manage connected apps, credentials, and log ingestion setup.",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Animated visualizations to understand log trends and severity patterns.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Profile, security, appearance, and notification preferences.",
  },
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const currentMeta =
    Object.entries(PAGE_META).find(([path]) => location.pathname.startsWith(path))?.[1] || {
      title: "LogScope",
      subtitle: "Modern observability with live logs, analytics, and application controls.",
    };

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (user === null) {
      navigate("/login", { replace: true });
    }
  }, [navigate, user]);

  async function handleLogout() {
    try {
      const socket = getSocket();
      socket.disconnect();
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen bg-transparent text-slate-900 transition-colors dark:text-slate-100">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="relative flex min-h-screen flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_32%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_28%)]" />

        <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
          <div className="mx-auto flex h-20 w-full max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl border border-slate-200 bg-white lg:hidden dark:border-slate-700 dark:bg-slate-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-600 dark:text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                Observability Workspace
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{currentMeta.title}</h1>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">{currentMeta.subtitle}</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm sm:flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <BellDot className="h-4 w-4 text-sky-600 dark:text-sky-300" />
              Live system updates enabled
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-11 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <User className="h-4 w-4" />
                  <span className="max-w-[180px] truncate">{user?.email || "Account"}</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-200 p-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                <DropdownMenuItem onClick={() => navigate("/settings")} className="rounded-xl">
                  <Settings className="mr-2 h-4 w-4" />
                  Profile settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLogoutOpen(true)}
                  className="rounded-xl text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="w-full animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>

      <Sidebar mobile open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <ConfirmLogoutModal open={logoutOpen} onOpenChange={setLogoutOpen} onConfirm={handleLogout} />
    </div>
  );
}

