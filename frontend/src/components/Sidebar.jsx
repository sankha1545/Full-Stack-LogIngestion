import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

/* shadcn-style UI primitives — replace / add if missing */
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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

/**
 * Sidebar props:
 * - mobile (bool) -> render mobile-friendly overlay behavior
 * - open (bool) -> for mobile: whether drawer is open
 * - onClose (fn) -> callback to close drawer (mobile)
 */
export default function Sidebar({ mobile = false, open = false, onClose }) {
  const [collapsed, setCollapsed] = useState(false); // desktop collapsed state
  const navFirstRef = useRef(null);

  const links = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  // Close on Escape (mobile)
  useEffect(() => {
    if (!mobile || !open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile, open, onClose]);

  // When mobile drawer opens, focus first nav item for accessibility
  useEffect(() => {
    if (mobile && open) {
      setTimeout(() => navFirstRef.current?.focus?.(), 120);
    }
  }, [mobile, open]);

  const containerClasses = collapsed
    ? "w-20"
    : "w-64";

  const linkBase =
    "group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors";

  return (
    <>
      {/* Mobile overlay */}
      {mobile && open && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => onClose?.()}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          ${mobile ? "fixed z-50 top-0 left-0 h-full" : "sticky top-0"}
          ${mobile ? (open ? "translate-x-0" : "-translate-x-full") : ""}
          ${!mobile ? containerClasses : "w-72"}
          transform transition-all duration-200 ease-in-out
          bg-white border-r shadow-sm
          flex flex-col
        `}
        style={{ minHeight: "100dvh" }}
        aria-label="Main navigation"
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center rounded-md ${
                collapsed ? "w-8 h-8" : "w-10 h-10"
              } bg-indigo-50`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="text-indigo-600"
              >
                <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 18h18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>

            {!collapsed && (
              <div>
                <div className="text-lg font-semibold leading-tight">
                  LogScope
                </div>
                <div className="text-xs text-slate-500">
                  Observability, simplified
                </div>
              </div>
            )}
          </div>

          {/* Close / collapse controls */}
          <div className="flex items-center gap-2">
            {!mobile && (
              <Tooltip content={collapsed ? "Expand" : "Collapse"}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed((c) => !c)}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {collapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronLeft className="w-4 h-4" />
                  )}
                </Button>
              </Tooltip>
            )}

            {mobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onClose?.()}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-3">
          <nav className="space-y-1">
            {links.map((item, idx) => {
              const Icon = item.icon;
              return (
               <NavLink
  to={item.path}
  end={item.path === "/"}
  className={({ isActive }) => {
    const base =
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors";

    const active = isActive
      ? "bg-indigo-600 text-white"
      : "text-slate-700 hover:bg-slate-100";

    return `${base} ${active} ${collapsed ? "justify-center" : ""}`;
  }}
>
  {({ isActive }) => (
    <>
      <span
        className={`flex items-center justify-center rounded-md ${
          collapsed ? "w-6 h-6" : "w-8 h-8"
        } ${isActive ? "bg-white/10" : ""}`}
      >
        <Icon
          className={`w-5 h-5 ${
            isActive ? "text-white" : "text-slate-600"
          }`}
        />
      </span>

      {!collapsed && <span className="truncate">{item.name}</span>}
    </>
  )}
</NavLink>

              );
            })}
          </nav>

          <div className="px-1 mt-4">
            <Separator />
          </div>

          {/* Quick actions */}
          <div className={`mt-4 px-2 ${collapsed ? "text-center" : ""}`}>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className={`flex-1 ${collapsed ? "hidden" : ""}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                New query
              </Button>

              <Tooltip content="Help">
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  aria-label="Help"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </ScrollArea>

        {/* Footer — profile + settings */}
        <div className="px-4 py-3 border-t">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <Avatar className="w-9 h-9">
              <AvatarImage src="/avatar.png" alt="You" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>

            {!collapsed ? (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Sankha Subhra</div>
                <div className="text-xs truncate text-slate-500">
                  sankhasubhradas1@gmail.com
                </div>
              </div>
            ) : null}

            {!collapsed ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  // navigate to settings
                  window.location.href = "/settings";
                }}
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            ) : (
              <Tooltip content="Settings">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => (window.location.href = "/settings")}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
