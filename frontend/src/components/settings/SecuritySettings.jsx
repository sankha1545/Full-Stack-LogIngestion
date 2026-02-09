import SettingSection from "@/components/settings/SettingSection";
import MFAToggle from "@/components/settings/MFAToggle";

export default function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Security</h2>

      <SettingSection
        title="Multi-factor authentication"
        description="Extra security for your account"
      >
        <MFAToggle />
      </SettingSection>
    </div>
  );
}
