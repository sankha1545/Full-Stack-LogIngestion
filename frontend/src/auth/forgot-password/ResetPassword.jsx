import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/api/forgotPasswordApi";
import { getPasswordStrength } from "./passwordStrength";
import { login } from "@/api/authApi";
import { useAuth } from "@/context/AuthContext";
import { clearOtpCooldown } from "@/utils/otpCooldown";

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login: saveToken } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

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
    if (loading) return;

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (strength.label === "Weak") {
      toast.error("Please choose a stronger password");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(state.email, password);

      // ✅ auto-login after reset
      const token = await login(state.email, password);
      saveToken(token);

      clearOtpCooldown();
      toast.success("Password updated successfully");

      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      cardTitle="Set new password"
      cardDescription="Choose a strong password to secure your account"
      footerPrompt="Changed your mind?"
      footerLinkText="Back to login"
      footerLinkTo="/login"
    >
      <form onSubmit={submit} className="space-y-4">
        {/* New password */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute -translate-y-1/2 right-3 top-1/2 text-white/60 hover:text-white"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {/* Confirm password */}
        <div className="relative">
          <Input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute -translate-y-1/2 right-3 top-1/2 text-white/60 hover:text-white"
          >
            {showConfirm ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {/* Password strength */}
        {password && (
          <div>
            <div className="flex justify-between text-xs text-white/60">
              <span>{strength.label}</span>
              <span>{password.length} chars</span>
            </div>
            <div className="h-2 mt-1 rounded bg-white/10">
              <div
                className={`h-2 rounded ${strength.color}`}
                style={{ width: `${strength.pct}%` }}
              />
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
