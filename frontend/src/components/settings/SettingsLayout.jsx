import { Outlet } from "react-router-dom";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";

function Spinner() {
  return (
    <div className="flex w-full items-center justify-center py-24">
      <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-sky-500 animate-spin" />
    </div>
  );
}

export default function SettingsLayout() {
  const { initializing } = useAuth();

  if (initializing) {
    return <Spinner />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:shadow-[0_30px_80px_rgba(2,6,23,0.42)]">
        <div className="grid gap-6 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Account settings
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight">A clearer settings experience for profile, security, and preferences.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              The settings area now uses cleaner navigation, stronger section framing, and more standard spacing so it feels easier to scan and safer to update.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Safer configuration flow</div>
                <div className="mt-1 text-sm text-slate-300">Profile, password, MFA, appearance, and notifications are grouped into a more intuitive workspace.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
        <div className="h-fit lg:sticky lg:top-24">
          <SettingsSidebar />
        </div>

        <Card className="rounded-[28px] border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-950/80">
          <CardContent className="p-6 md:p-8">
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
