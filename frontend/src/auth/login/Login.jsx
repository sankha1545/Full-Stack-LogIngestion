import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import OAuthButtons from "../OAuthButtons";

import { useAuth } from "@/context/AuthContext";
import { login } from "@/api/authApi";

/**
 * Login page
 * - Email + password login
 * - OAuth (Google / GitHub)
 * - Show / hide password
 * - Forgot password flow
 */
export default function Login() {
  const { login: saveToken } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ----------------------------------------
     Submit email/password login
  ---------------------------------------- */
  async function submit(e) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const token = await login(email, password);
      saveToken(token);
      navigate("/dashboard");
    } catch (err) {
      const msg = err?.message || "Invalid credentials";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  /* ----------------------------------------
     Forgot password
  ---------------------------------------- */
  const handleForgotPassword = () => {
    if (!email) {
      toast("Enter your email first", { icon: "📧" });
      return;
    }
    navigate("/forgot-password", { state: { email } });
  };

  return (
    <AuthLayout
      cardTitle="Welcome back"
      cardDescription="Log in to your account to continue"
      footerPrompt="Don't have an account?"
      footerLinkText="Create one"
      footerLinkTo="/signup"
    >
      {/* Error */}
      {error && (
        <div className="p-3 mb-2 text-sm text-red-400 border rounded bg-red-500/10 border-red-500/20">
          {error}
        </div>
      )}

      {/* OAuth (Google / GitHub) */}
      <OAuthButtons />

      {/* Divider */}
      <div className="flex items-center gap-3 my-2 text-sm text-white/40">
        <div className="flex-1 h-px bg-white/10" />
        <div className="px-2 text-xs">or with email</div>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Email/password form */}
      <form onSubmit={submit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block mb-1 text-sm text-white/70">Email</label>
          <div className="relative">
            <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-white/40" />
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
              className="pl-10 bg-white/5 border-white/10 focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 text-sm text-white/70">Password</label>
          <div className="relative">
            <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-white/40" />
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
              className="pl-10 pr-10 bg-white/5 border-white/10 focus-visible:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute -translate-y-1/2 right-3 top-1/2 text-white/50 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-white transition bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Login
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      {/* Trust */}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/50">
        <ShieldCheck className="w-4 h-4 text-indigo-400" />
        Secure authentication · Encrypted sessions
      </div>

      {/* Forgot password */}
      <div className="mt-2 text-sm text-center text-white/60">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-indigo-400 hover:underline"
        >
          Forgot password?
        </button>
      </div>
    </AuthLayout>
  );
}
