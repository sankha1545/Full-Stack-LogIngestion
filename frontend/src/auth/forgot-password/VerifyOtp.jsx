import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { verifyResetOtp } from "@/api/forgotPasswordApi";
import OtpInput from "@/components/auth/OtpInput";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  /* -----------------------------------------
     Guard: missing email (refresh / deep link)
  ------------------------------------------ */
  useEffect(() => {
    if (!state?.email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [state, navigate]);

  /* -----------------------------------------
     Submit handler
  ------------------------------------------ */
  async function submit(e) {
    e.preventDefault();
    if (loading || code.length !== 4) return;

    try {
      setLoading(true);
      await verifyResetOtp(state.email, code);
      toast.success("OTP verified");
      navigate("/forgot-password/reset", { state });
    } catch (err) {
      toast.error(err?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      cardTitle="Verify OTP"
      cardDescription="Enter the 4-digit code sent to your email"
      footerPrompt="Didn’t receive the code?"
      footerLinkText="Resend"
      footerLinkTo="/forgot-password"
    >
      <form onSubmit={submit} className="space-y-6">
        {/* OTP boxes */}
        <OtpInput value={code} onChange={setCode} />

        <Button
          type="submit"
          disabled={loading || code.length !== 4}
          className="w-full"
        >
          {loading ? "Verifying…" : "Verify OTP"}
        </Button>
      </form>
    </AuthLayout>
  );
}
