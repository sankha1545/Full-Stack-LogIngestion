import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Loader2, ShieldCheck } from "lucide-react";

export default function MFAChallenge() {
  const navigate = useNavigate();
  const {
    tempMfaSession,
    login,
    clearTempMfaSession,
  } = useAuth();

  const [code, setCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =========================
     SAFE REDIRECT CHECK
  ========================= */

  useEffect(() => {
    if (!tempMfaSession?.tempToken) {
      navigate("/login", { replace: true });
    }
  }, [tempMfaSession, navigate]);

  if (!tempMfaSession?.tempToken) return null;

  /* =========================
     SUBMIT
  ========================= */

  async function submit(e) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/mfa/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            tempToken: tempMfaSession.tempToken,
            code: code.trim(),
            rememberDevice,
          }),
        }
      );

      const body = await res.json();

      if (!res.ok) {
        if (body.lockedUntil) {
          toast.error(
            `Account locked until ${new Date(
              body.lockedUntil
            ).toLocaleTimeString()}`
          );
        } else {
          toast.error(body.error || "Invalid code");
        }
        return;
      }

      /* =========================
         SUCCESS
      ========================= */

      login(body.token, body.user);
      clearTempMfaSession();

      toast.success("Authentication complete");

      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error(err);
      toast.error("Failed to verify code");
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md p-6 space-y-6 border rounded-2xl bg-white/5 border-white/10 backdrop-blur">

        <div className="text-center">
          <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">
            Multi-factor authentication
          </h2>
          <p className="text-sm text-white/50">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength={8}
            required
            disabled={loading}
            className="text-lg tracking-widest text-center text-white bg-white/5 border-white/10"
          />

          <div className="flex items-center gap-2 text-sm text-white/60">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) =>
                setRememberDevice(e.target.checked)
              }
            />
            <span>Remember this device for 30 days</span>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify"
            )}
          </Button>
        </form>

        <div className="text-xs text-center text-white/40">
          You can also enter a recovery code
        </div>
      </div>
    </div>
  );
}
