import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/auth/AuthLayout";
import OAuthButtons from "../OAuthButtons";
import { useAuth } from "@/context/AuthContext";
import { login as loginApi } from "@/api/authApi";

export default function Login() {
  const {
    token,
    user,
    login: saveSession,
    setTempMfaSession,
    clearTempMfaSession,
  } = useAuth();

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, user, navigate]);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await loginApi(email, password);

      if (response?.mfaRequired) {
        setTempMfaSession({
          tempToken: response.tempToken,
          email,
        });

        toast("Multi-factor authentication required", {
          icon: "🔐",
        });

        navigate("/mfa-verify", { replace: true });
        return;
      }

      if (response?.token) {
        clearTempMfaSession();
        saveSession(response.token, response.user);
        toast.success("Login successful");
        navigate("/dashboard", { replace: true });
        return;
      }

      throw new Error("Unexpected authentication response");
    } catch (err) {
      const backendError = err?.response?.data?.error || err?.message || "Invalid credentials";
      const lockedUntil = err?.response?.data?.lockedUntil;

      if (lockedUntil) {
        toast.error(`Account locked until ${new Date(lockedUntil).toLocaleTimeString()}`);
      } else {
        toast.error(backendError);
      }

      setError(backendError);
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword() {
    if (!email) {
      toast("Enter your email first", { icon: "📧" });
      return;
    }
    navigate("/forgot-password", { state: { email } });
  }

  return (
    <AuthLayout
      cardTitle="Welcome back"
      cardDescription="Sign in to access your live logs, analytics, applications, and team workspace."
      footerPrompt="Don't have an account?"
      footerLinkText="Create one"
      footerLinkTo="/signup"
    >
      <div className="space-y-6">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-sky-400/20 to-indigo-500/20 p-3 text-sky-300 ring-1 ring-sky-400/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/90">
                <Sparkles className="h-3.5 w-3.5" />
                Premium sign in
              </div>
              <p className="mt-3 text-sm leading-7 text-white/72">
                Enter your account credentials to continue into the LogScope workspace with the same premium SaaS treatment as the rest of the product.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <OAuthButtons />

        <div className="flex items-center gap-3 text-sm text-white/40">
          <div className="h-px flex-1 bg-white/10" />
          <div className="px-2 text-[11px] uppercase tracking-[0.22em]">or continue with email</div>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Email address">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/35 focus-visible:ring-sky-400/60"
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Your password"
                  required
                  disabled={loading}
                  className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-white/35 focus-visible:ring-sky-400/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/65">
            Secure authentication with protected sessions and optional multi-factor verification.
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-2xl bg-white font-medium text-slate-950 hover:bg-slate-100 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Login to workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 text-xs text-white/50">
          <ShieldCheck className="h-4 w-4 text-sky-300" />
          Secure authentication · Encrypted sessions
        </div>

        <div className="text-sm text-center text-white/60">
          <button type="button" onClick={handleForgotPassword} className="text-sky-300 hover:text-sky-200 hover:underline">
            Forgot password?
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/78">{label}</label>
      {children}
    </div>
  );
}
