import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SettingSection from "@/components/settings/SettingSection";

export default function ProfileSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Profile</h2>

      <SettingSection
        title="Basic information"
        description="Update your personal details"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input placeholder="Username" />
          <Input placeholder="Email" disabled />
        </div>

        <Button className="mt-4">Save changes</Button>
      </SettingSection>
    </div>
  );
}
