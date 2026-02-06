import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import OAuthButtons from "../OAuthButtons";

import { useAuth } from "../../context/AuthContext";
import { login } from "../../api/authApi";

/**
 * Login page: uses AuthLayout for consistent look with Signup.
 * Includes Google + GitHub sign-in (handlers are placeholders — replace with your OAuth flow).
 */
export default function Login() {
  const { login: saveToken } = useAuth(); // user-provided context
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = await login(email, password); // your API call
      saveToken(token);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // placeholder handlers for OAuth flows — wire to your backend
  const handleGoogle = () => {
    // redirect to your Google OAuth endpoint or open popup
    window.location.href = "/auth/google";
  };

  const handleGithub = () => {
    // redirect to your GitHub OAuth endpoint
    window.location.href = "/auth/github";
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

      {/* OAuth buttons */}
      <OAuthButtons onGoogle={handleGoogle} onGithub={handleGithub} />

      {/* or separator */}
      <div className="flex items-center gap-3 my-2 text-sm text-white/40">
        <div className="flex-1 h-px bg-white/10" />
        <div className="px-2 text-xs">or with email</div>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Form */}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm text-white/70">Email</label>
          <div className="relative">
            <Mail className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-white/40" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="pl-10 bg-white/5 border-white/10 focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm text-white/70">Password</label>
          <div className="relative">
            <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-white/40" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="pl-10 bg-white/5 border-white/10 focus-visible:ring-indigo-500"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 font-medium transition bg-indigo-600 rounded-xl hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* Trust cue */}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/50">
        <ShieldCheck className="w-4 h-4 text-indigo-400" />
        Secure authentication · Encrypted sessions
      </div>

      {/* Small footer link (in addition to AuthLayout footer) */}
      <div className="mt-2 text-sm text-center text-white/60">
        <Link to="/forgot-password" className="text-indigo-400 hover:underline">
          Forgot password?
        </Link>
      </div>
    </AuthLayout>
  );
}
