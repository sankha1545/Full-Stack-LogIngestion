import SettingSection from "@/components/settings/SettingSection";
import MFAToggle from "@/components/settings/MFAToggle";
import ChangePasswordButton from "@/components/settings/ChangePasswordButton";

export default function SecuritySettings() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h2 className="text-xl font-semibold">Security</h2>

      {/* MFA Section */}
      <SettingSection
        title="Multi-factor authentication"
        description="Extra security for your account"
      >
        <MFAToggle />
      </SettingSection>

      {/* Password Section (NEW) */}
      <SettingSection
        title="Password"
        description="Update your account password. Available only for email/password accounts."
      >
        <ChangePasswordButton />
      </SettingSection>
    </div>
  );
}
