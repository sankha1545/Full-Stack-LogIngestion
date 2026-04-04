import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Boxes,
  BarChart3,
  Settings,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Settings", path: "/settings", icon: Settings },
];

function SidebarInner({ mobile = false, open = false, onClose }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const firstNavRef = useRef(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    } catch {
      console.debug("Sidebar: invalid token");
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!mounted || !res.ok) return;
        const data = await res.json();
        setProfile(data);
      } catch {
        console.debug("Sidebar: profile load failed");
      }
    }

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mobile || !open) return;

    const onKey = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile, onClose, open]);

  useEffect(() => {
    if (mobile && open) {
      const timeout = setTimeout(() => firstNavRef.current?.focus?.(), 150);
      return () => clearTimeout(timeout);
    }
  }, [mobile, open]);

  const fullName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : user?.username || "Workspace User";

  const initials = fullName
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleClose = useCallback(() => onClose?.(), [onClose]);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      if (mobile) {
        onClose?.();
      }
    },
    [mobile, navigate, onClose]
  );

  return (
    <>
      {mobile && open && <div className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm" onClick={handleClose} />}

      <aside
        className={`
          ${mobile ? "fixed left-0 top-0 z-[100] h-full transform transition-transform duration-300" : "sticky top-0"}
          ${mobile ? (open ? "translate-x-0" : "-translate-x-full") : ""}
          ${collapsed && !mobile ? "w-[94px]" : "w-80"}
          flex min-h-screen flex-col border-r border-slate-200/80 bg-white/95 text-slate-900 shadow-[0_0_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950 dark:text-slate-50 dark:shadow-[0_0_40px_rgba(15,23,42,0.12)]
        `}
      >
        <div className="border-b border-slate-200 px-4 py-5 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 shadow-lg rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-blue-900/30">
                <div className="w-5 h-5 rounded-md bg-white/90" />
              </div>

              {!collapsed && (
                <div>
                  <div className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">LogScope</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Advanced monitoring workspace</div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {!mobile && (
                <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white" onClick={() => setCollapsed((value) => !value)}>
                  {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              )}

              {mobile && (
                <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white" onClick={handleClose}>
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {!collapsed && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Quick action</div>
              <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Create and connect a new application, then start tailing live logs instantly.</div>
              <Button className="mt-4 w-full rounded-xl" onClick={() => handleNavigate("/applications")}>
                <Plus className="w-4 h-4 mr-2" />
                Open Applications
              </Button>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  ref={index === 0 ? firstNavRef : null}
                  onClick={() => handleNavigate(item.path)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl border-l-2 px-3 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "border-sky-500 bg-sky-50/80 text-slate-950 dark:bg-slate-900/80 dark:text-white"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-100/80 hover:text-slate-950 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900/60 dark:hover:text-slate-100"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-slate-200 group-hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:bg-slate-800 dark:group-hover:text-slate-100">
                    <Icon className="w-5 h-5" />
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          <Separator className="my-5 bg-slate-200 dark:bg-white/10" />

          <div className={`space-y-2 ${collapsed ? "items-center" : ""}`}>
            <Button
              variant="ghost"
              className={`w-full rounded-xl border-l-2 border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-100/80 hover:text-slate-950 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900/60 dark:hover:text-slate-100 ${collapsed ? "px-0 justify-center" : "justify-start px-3"}`}
              onClick={() => {
                window.open("/docs", "_blank");
                if (mobile) onClose?.();
              }}
            >
              <BookOpen className="w-4 h-4" />
              {!collapsed && <span>Documentation</span>}
            </Button>
          </div>
        </ScrollArea>

        <div className="border-t border-slate-200 px-4 py-4 dark:border-white/10">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <Avatar className="h-10 w-10 border border-slate-200 dark:border-white/10">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback className="bg-slate-100 text-slate-950 dark:bg-white/10 dark:text-white">{initials}</AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold text-slate-950 dark:text-white">{fullName}</div>
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email || ""}</div>
              </div>
            )}

            {!collapsed && (
              <Button variant="ghost" size="icon" className="rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white" onClick={() => handleNavigate("/settings")}>
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default React.memo(SidebarInner);
