import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MFASetup from "./MFASetup";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function MFAToggle() {
/* ⭐ use global auth state */
const { token, user, refreshUser } = useAuth();
const API_URL = import.meta.env.VITE_API_URL;

const [showSetup, setShowSetup] = useState(false);
const [loading, setLoading] = useState(false);

/* ⭐ source of truth */
const enabled = Boolean(user?.mfaEnabled);

/* =========================================
TOGGLE HANDLER
========================================= */

async function onToggle(v) {
if (loading) return;


/* ---------- ENABLE MFA ---------- */
if (v) {
  setShowSetup(true);
  return;
}

/* ---------- DISABLE MFA ---------- */
const code = prompt("Enter authenticator code to disable MFA");
if (!code) return;

try {
  setLoading(true);

  const res = await fetch(`${API_URL}/api/auth/mfa/disable`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    toast.error(body.error || "Failed to disable MFA");
    return;
  }

  toast.success("MFA disabled");

  /* ⭐ refresh global auth state */
  await refreshUser();

} catch {
  toast.error("Failed to disable MFA");
} finally {
  setLoading(false);
}


}

/* =========================================
UI
========================================= */

return (
<> <div className="flex items-center justify-between gap-4"> <div> <Label>Multi-factor authentication</Label> <p className="text-xs text-muted-foreground">
Require OTP during login </p> </div>


    <Switch
      checked={enabled}
      disabled={loading}
      onCheckedChange={onToggle}
    />
  </div>

  {/* MFA SETUP MODAL */}
  {showSetup && (
    <MFASetup
      onClose={async () => {
        setShowSetup(false);

        /* ⭐ refresh after setup */
        await refreshUser();
      }}
    />
  )}
</>


);
}
