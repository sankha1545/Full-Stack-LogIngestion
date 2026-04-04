import SettingSection from "@/components/settings/SettingSection";
import ThemeToggle from "@/components/settings/ThemeToggle";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function AppearanceSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Appearance</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Switch the entire workspace between light and dark themes with readable contrast across navigation, cards, logs, and settings.
        </p>
      </div>

      <SettingSection
        title="Theme"
        description="Customize how LogScope looks across the complete application."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className={`rounded-[24px] border p-5 transition ${theme === "light" ? "border-sky-200 bg-sky-50/80 shadow-sm dark:border-sky-500/40 dark:bg-sky-500/10" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60"}`}>
            <div className="inline-flex rounded-2xl bg-white p-3 text-amber-500 shadow-sm dark:bg-slate-800 dark:text-amber-300">
              <SunMedium className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Light theme</div>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Bright surfaces, crisp typography, and elevated cards for daytime monitoring and account workflows.
            </p>
          </div>

          <div className={`rounded-[24px] border p-5 transition ${theme === "dark" ? "border-sky-500/40 bg-slate-950 shadow-sm" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60"}`}>
            <div className="inline-flex rounded-2xl bg-slate-950 p-3 text-sky-200 shadow-sm dark:bg-slate-800 dark:text-sky-300">
              <MoonStar className="h-5 w-5" />
            </div>
            <div className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Dark theme</div>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Lower-glare canvases, stronger contrast for terminals and logs, and better focus for long-running sessions.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/70">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Active theme: <span className="capitalize">{theme}</span>
            </div>
            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              The preference is saved locally and applied to the full application immediately.
            </div>
          </div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </SettingSection>
    </div>
  );
}
