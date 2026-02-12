import { NavLink } from "react-router-dom";
import { User, Shield, Moon ,Bell} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Profile",
    description: "Personal information",
    icon: User,
    path: "profile",
  },
  {
    title: "Security",
    description: "Password & MFA",
    icon: Shield,
    path: "security",
  },
  {
    title: "Appearance",
    description: "Theme preferences",
    icon: Moon,
    path: "appearance",
  },
  {
  title: "Notifications",
  description: "Alerts & integrations",
  icon: Bell,
  path: "notifications",
},

];

export default function SettingsSidebar() {
  return (
    <div className="p-4 space-y-2 border shadow-sm rounded-2xl bg-card">

      <div className="px-2 mb-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Preferences
        </h2>
      </div>

      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group relative flex items-start gap-3 rounded-xl px-4 py-3 transition-all",
                isActive
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted/50 text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active rail indicator */}
                <span
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r transition-all",
                    isActive
                      ? "bg-gradient-to-b from-indigo-500 to-pink-500"
                      : "bg-transparent"
                  )}
                />

                <Icon className="w-5 h-5 mt-1 shrink-0" />

                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  );
}
