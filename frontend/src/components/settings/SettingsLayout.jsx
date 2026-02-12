import { Outlet } from "react-router-dom";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function SettingsLayout() {
  return (
    <div className="max-w-6xl px-4 py-8 mx-auto">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">

        {/* Sidebar */}
        <div className="lg:sticky lg:top-24 h-fit">
          <SettingsSidebar />
        </div>

        {/* Content */}
        <Card className="border shadow-sm rounded-2xl">
          <CardContent className="p-6 md:p-8">
            <Outlet />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
