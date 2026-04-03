import { KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import SettingSection from "@/components/settings/SettingSection";
import MFAToggle from "@/components/settings/MFAToggle";
import ChangePasswordButton from "@/components/settings/ChangePasswordButton";

export default function SecuritySettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Security</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          A cleaner security workspace for password changes, MFA controls, and account protection.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SecurityCard icon={ShieldCheck} title="Protection" text="Use stronger account controls with a more standard visual hierarchy." />
        <SecurityCard icon={LockKeyhole} title="MFA" text="Enable multi-factor authentication from a clearer, safer section." />
        <SecurityCard icon={KeyRound} title="Credentials" text="Update account access details without losing context." />
      </div>

      <SettingSection
        title="Multi-factor authentication"
        description="Extra security for your account with a more polished settings flow."
      >
        <MFAToggle />
      </SettingSection>

      <SettingSection
        title="Password"
        description="Update your account password. Available only for email/password accounts."
      >
        <ChangePasswordButton />
      </SettingSection>
    </div>
  );
}

function SecurityCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="inline-flex rounded-2xl bg-white p-3 text-sky-600 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-4 text-lg font-semibold text-slate-950">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
