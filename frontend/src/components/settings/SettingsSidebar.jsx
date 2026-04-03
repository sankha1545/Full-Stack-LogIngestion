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
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="rounded-2xl bg-slate-50 px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Preferences</div>
        <div className="mt-2 text-sm leading-6 text-slate-600">Navigate settings with clearer group labels and stronger visual feedback.</div>
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
                  "group relative flex items-start gap-3 rounded-2xl px-4 py-4 transition-all",
                  isActive
                    ? "bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.15)]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn("rounded-2xl p-2.5", isActive ? "bg-white/10 text-sky-200" : "bg-slate-100 text-slate-600") }>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className={cn("mt-1 text-xs leading-5", isActive ? "text-slate-300" : "text-slate-500")}>
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
