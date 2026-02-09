import { Outlet } from "react-router-dom";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

export default function SettingsLayout() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <SettingsSidebar />
      <div className="flex-1 p-6 border rounded-lg bg-card">
        <Outlet />
      </div>
    </div>
  );
}
