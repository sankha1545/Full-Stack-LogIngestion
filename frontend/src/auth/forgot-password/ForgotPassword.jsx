import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthLayout from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendResetOtp } from "@/api/forgotPasswordApi";
import {
  startOtpCooldown,
  getOtpCooldown,
} from "@/utils/otpCooldown";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(getOtpCooldown());
  const [loading, setLoading] = useState(false);

  /* -----------------------------------------
     Cooldown timer (persists across refresh)
  ------------------------------------------ */
  useEffect(() => {
    if (!cooldown) return;

    const timer = setInterval(() => {
      setCooldown(getOtpCooldown());
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  /* -----------------------------------------
     Submit handler
  ------------------------------------------ */
  async function submit(e) {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await sendResetOtp(email);

      startOtpCooldown(30);
      setCooldown(30);

      toast.success("OTP sent to your email");
      navigate("/forgot-password/verify", { state: { email } });
    } catch (err) {
      toast.error(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      cardTitle="Forgot password"
      cardDescription="Enter your email to receive a one-time code"
      footerPrompt="Remember your password?"
      footerLinkText="Back to login"
      footerLinkTo="/login"
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <Button
          type="submit"
          disabled={loading || cooldown > 0}
        >
          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : loading
            ? "Sending…"
            : "Send OTP"}
        </Button>
      </form>
    </AuthLayout>
  );
}
