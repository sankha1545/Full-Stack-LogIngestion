import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import MFASetup from "./MFASetup";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function MFAToggle() {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  /* =========================================
     FETCH PROFILE (REAL STATE)
  ========================================= */

  async function fetchProfile() {
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();

      console.log("PROFILE:", data); // debug

      setEnabled(Boolean(data?.mfaEnabled));

    } catch (err) {
      console.error("Profile fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [token]);

  /* =========================================
     TOGGLE HANDLER
  ========================================= */

  async function onToggle(v) {
    if (loading) return;

    /* ---------- ENABLE ---------- */
    if (v) {
      setShowSetup(true);
      return;
    }

    /* ---------- DISABLE ---------- */
    const code = prompt("Enter authenticator code to disable MFA");
    if (!code) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/mfa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const body = await res.json();

      if (!res.ok) {
        toast.error(body.error || "Failed to disable MFA");
        return;
      }

      toast.success("MFA disabled");

      await fetchProfile(); // 🔥 refresh state

    } catch (err) {
      toast.error("Failed to disable MFA");
    }
  }

  /* =========================================
     UI
  ========================================= */

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label>Multi-factor authentication</Label>
          <p className="text-xs text-muted-foreground">
            Require OTP during login
          </p>
        </div>

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
            await fetchProfile(); // 🔥 refresh after setup
          }}
        />
      )}
    </>
  );
}
