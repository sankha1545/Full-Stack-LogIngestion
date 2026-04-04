import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Clock3,
  Loader2,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/auth/AuthLayout";
import { cn } from "@/lib/utils";

const CODE_LENGTH = 6;

export default function MFAChallenge() {
  const navigate = useNavigate();
  const { tempMfaSession, login, clearTempMfaSession } = useAuth();

  const [code, setCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!tempMfaSession?.tempToken) {
      navigate("/login", { replace: true });
    }
  }, [tempMfaSession, navigate]);

  const digits = useMemo(() => {
    const items = code.slice(0, CODE_LENGTH).split("");
    while (items.length < CODE_LENGTH) items.push("");
    return items;
  }, [code]);

  if (!tempMfaSession?.tempToken) return null;

  function updateDigit(index, value) {
    const digit = value.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[index] = digit;
    const normalized = next.join("").slice(0, CODE_LENGTH);
    setCode(normalized);

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
      inputsRef.current[index + 1]?.select?.();
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setCode(next.join("").trimEnd());
        return;
      }

      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(event) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    setCode(pasted);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  async function submit(event) {
    event.preventDefault();
    if (loading || code.trim().length !== CODE_LENGTH) return;

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/mfa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tempToken: tempMfaSession.tempToken,
          code: code.trim(),
          rememberDevice,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        if (body.lockedUntil) {
          toast.error(`Account locked until ${new Date(body.lockedUntil).toLocaleTimeString()}`);
        } else {
          toast.error(body.error || "Invalid code");
        }
        return;
      }

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

  return (
    <AuthLayout
      cardTitle="Verify your identity"
      cardDescription="Enter the 6-digit code from your authenticator app to complete sign in."
      footerPrompt="Need to start over?"
      footerLinkText="Back to login"
      footerLinkTo="/login"
      showLeft
    >
      <div className="space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-sky-400/20 to-indigo-500/20 p-3 text-sky-300 ring-1 ring-sky-400/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/90">
                <Sparkles className="h-3.5 w-3.5" />
                Elite MFA checkpoint
              </div>
              <p className="text-sm leading-7 text-white/72">
                {tempMfaSession?.email
                  ? `Verifying access for ${tempMfaSession.email}.`
                  : "Verifying access for your account."} This step is designed to feel calmer, clearer, and more premium while keeping the action obvious.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-white/80">Authentication code</label>
              <div className="inline-flex items-center gap-2 text-xs text-white/45">
                <Smartphone className="h-3.5 w-3.5 text-sky-300" />
                Authenticator app
              </div>
            </div>

            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  disabled={loading}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  className={cn(
                    "h-14 w-12 rounded-2xl border text-center text-2xl font-semibold tracking-[0.18em] text-white outline-none transition-all sm:h-16 sm:w-14",
                    "border-white/12 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                    "focus:border-sky-400/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-sky-400/30"
                  )}
                />
              ))}
            </div>

            <p className="mt-3 text-center text-xs text-white/42">
              Paste the full code or type it digit by digit.
            </p>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <label className="flex items-start gap-3 text-sm text-white/72">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(event) => setRememberDevice(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-sky-500"
              />
              <span>
                Remember this device for 30 days
                <span className="mt-1 block text-xs text-white/45">
                  Skip MFA on this trusted device unless your security state changes.
                </span>
              </span>
            </label>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-xs text-white/55">
              <Clock3 className="h-3.5 w-3.5 text-sky-300" />
              Recovery codes also supported
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || code.trim().length !== CODE_LENGTH}
            className="h-12 w-full rounded-2xl bg-white font-medium text-slate-950 hover:bg-slate-100"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying secure access...
              </>
            ) : (
              <>
                Complete sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="rounded-[24px] border border-white/10 bg-gradient-to-r from-white/[0.05] to-white/[0.02] p-4 text-sm leading-7 text-white/58">
          If your authenticator code is unavailable, you can enter a recovery code from the same field above.
        </div>
      </div>
    </AuthLayout>
  );
}
