import SettingSection from "@/components/settings/SettingSection";
import ThemeToggle from "@/components/settings/ThemeToggle";
import { useState } from "react";

export default function AppearanceSettings() {
  const [theme, setTheme] = useState(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Appearance</h2>

      <SettingSection
        title="Theme"
        description="Customize how LogScope looks"
      >
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </SettingSection>
    </div>
  );
}
