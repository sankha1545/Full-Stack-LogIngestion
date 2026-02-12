// src/components/ui/sidebar/Sidebar.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip } from "@/components/ui/tooltip";

import {
  Home,
  BarChart3,
  Settings,
  Plus,
  HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* --------------------------------------------------
   Navigation config
-------------------------------------------------- */

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Settings", path: "/settings", icon: Settings },
];

function SidebarInner({ mobile = false, open = false, onClose }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const firstNavRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  /* ---------------- Load logged-in user from JWT ---------------- */
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const raw = token.split(".")[1];
      if (!raw) return;
      const payload = JSON.parse(atob(raw));
      setUser(payload);
    } catch (err) {
      // don't spam console on bad token
      console.debug("Sidebar: invalid token or parsing failed");
    }
  }, []);

  /* ---------------- Fetch profile (once) ---------------- */
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch("/api/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.debug("Sidebar: failed to load profile");
      }
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const fullName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : user?.username || "User";

  const email = user?.email || "";

  const initials = fullName
    ?.split(" ")
    .map((n) => n[0] || "")
    .join("")
    .substring(0, 2)
    .toUpperCase();

  /* ---------------- ESC close (mobile) ---------------- */
  useEffect(() => {
    if (!mobile || !open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile, open, onClose]);

  /* ---------------- Auto focus (mobile) ---------------- */
  useEffect(() => {
    if (mobile && open) {
      // small delay to allow animation to complete before focusing
      const t = setTimeout(() => firstNavRef.current?.focus?.(), 160);
      return () => clearTimeout(t);
    }
  }, [mobile, open]);

  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);
  const handleClose = useCallback(() => onClose?.(), [onClose]);

  return (
    <>
      {mobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      <aside
        className={`
          ${mobile ? "fixed top-0 left-0 z-[100] h-full transform transition-transform duration-300" : "sticky top-0"}
          ${mobile ? (open ? "translate-x-0" : "-translate-x-full") : ""}
          ${collapsed && !mobile ? "w-[88px]" : "w-72"}
          bg-white border-r flex flex-col
        `}
        style={{ minHeight: "100dvh" }}
        aria-label="Sidebar"
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center shadow-sm w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <div className="w-5 h-5 rounded-md bg-white/90" />
            </div>

            {!collapsed && (
              <div className="leading-tight">
                <div className="text-lg font-bold tracking-tight">LogScope</div>
                <div className="text-xs text-slate-500">Observability platform</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!mobile && (
              <Tooltip content={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
                <Button variant="ghost" size="icon" onClick={toggleCollapsed}>
                  {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              </Tooltip>
            )}

            {mobile && (
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  ref={idx === 0 ? firstNavRef : null}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-100"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                >
                  <span className="flex items-center justify-center transition rounded-lg w-9 h-9 group-hover:bg-white">
                    <Icon className="w-5 h-5" />
                  </span>

                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          <Separator className="my-5" />

          <div className={`space-y-2 ${collapsed ? "text-center" : ""}`}>
            {!collapsed && (
              <Button className="justify-start w-full" onClick={() => navigate("/queries/new")}>
                <Plus className="w-4 h-4 mr-2" />
                New Query
              </Button>
            )}

            <Tooltip content="Help & documentation">
              <Button variant="ghost" size="icon" className="mx-auto" onClick={() => window.open("/docs", "_blank")}>
                <HelpCircle className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </ScrollArea>

        {/* Profile Section */}
        <div className="px-4 py-4 border-t">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <Avatar className="w-9 h-9">
              <AvatarImage src="/avatar.png" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{fullName}</div>
                <div className="text-xs truncate text-slate-500">{email}</div>
              </div>
            )}

            <Tooltip content="Account settings">
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </aside>
    </>
  );
}

export default React.memo(SidebarInner);
