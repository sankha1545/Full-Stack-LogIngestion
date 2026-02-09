import { NavLink } from "react-router-dom";
import { User, Shield, Moon } from "lucide-react";

export default function SettingsSidebar() {
  return (
    <aside className="w-64 p-4 space-y-2 border rounded-lg bg-card">
      <NavLink to="profile" className="flex items-center gap-2 p-2 rounded hover:bg-muted">
        <User className="w-4 h-4" /> Edit Profile
      </NavLink>

      <NavLink to="security" className="flex items-center gap-2 p-2 rounded hover:bg-muted">
        <Shield className="w-4 h-4" /> Security & MFA
      </NavLink>

      <NavLink to="appearance" className="flex items-center gap-2 p-2 rounded hover:bg-muted">
        <Moon className="w-4 h-4" /> Appearance
      </NavLink>
    </aside>
  );
}
