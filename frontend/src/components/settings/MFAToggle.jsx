import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function MFAToggle() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label>Multi-factor authentication</Label>
        <p className="text-xs text-muted-foreground">
          Require OTP during login
        </p>
      </div>
      <Switch />
    </div>
  );
}
