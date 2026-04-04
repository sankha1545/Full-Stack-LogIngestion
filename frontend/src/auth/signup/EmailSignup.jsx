import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Mail, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EmailSignup({ onOtpSent }) {
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((value) => value - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  async function sendOtp() {
    if (!email || loading) return;

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3001/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to send OTP");

      setTimer(30);
      onOtpSent(email);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-sky-400/20 to-indigo-500/20 p-3 text-sky-300 ring-1 ring-sky-400/20">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/90">
              <Sparkles className="h-3.5 w-3.5" />
              Email verification
            </div>
            <p className="mt-3 text-sm leading-7 text-white/72">
              We’ll send a one-time verification code to your email so you can complete account creation in a secure, polished flow.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/78">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/35 focus-visible:ring-sky-400/60"
          />
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/65">
        By continuing, you agree to receive emails related to account verification.
      </div>

      <Button
        onClick={sendOtp}
        disabled={!email || timer > 0 || loading}
        className="h-12 w-full rounded-2xl bg-white font-medium text-slate-950 hover:bg-slate-100 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending verification code...
          </>
        ) : timer > 0 ? (
          `Resend in ${timer}s`
        ) : (
          <>
            Send verification code
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
