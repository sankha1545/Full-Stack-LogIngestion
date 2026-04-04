import { NavLink } from "react-router-dom";
import { User, Shield, Moon, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Profile", description: "Personal details and account identity", icon: User, path: "profile" },
  { title: "Security", description: "Password, MFA, and verification", icon: Shield, path: "security" },
  { title: "Appearance", description: "Theme and interface preferences", icon: Moon, path: "appearance" },
  { title: "Notifications", description: "Alerts and communication settings", icon: Bell, path: "notifications" },
];

export default function SettingsSidebar() {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
      <div className="rounded-2xl bg-slate-50 px-4 py-4 dark:bg-slate-900/80">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Preferences</div>
        <div className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Navigate settings with clearer group labels and stronger visual feedback.</div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-start gap-3 rounded-xl border-l-2 px-4 py-4 transition-all",
                  isActive
                    ? "border-sky-500 bg-sky-50/80 text-slate-950 dark:bg-slate-900/80 dark:text-slate-50"
                    : "border-transparent text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900/80 dark:hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn("rounded-2xl p-2.5 transition-colors", isActive ? "bg-white text-sky-600 shadow-sm dark:bg-slate-800 dark:text-sky-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300") }>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className={cn("mt-1 text-xs leading-5", isActive ? "text-slate-300 dark:text-slate-300" : "text-slate-500 dark:text-slate-400")}>
                      {item.description}
                    </div>
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
