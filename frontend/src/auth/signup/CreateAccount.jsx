import { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import PasswordStrength from "./passwordStrength";
import { useAuth } from "@/context/AuthContext";

export default function CreateAccount({ email }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    username &&
    password &&
    confirm &&
    password === confirm;

  const submit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Signup failed");
      }

      const { token } = await res.json();

      // 🔐 Save JWT
      login(token);

      // 🚀 Redirect
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">
          Create your account
        </h3>
        <p className="text-sm text-gray-400">
          Final step — set up your credentials
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">
          {error}
        </div>
      )}

      {/* Username */}
      <div className="space-y-2">
        <Label className="text-gray-300">Username</Label>
        <div className="relative">
          <User className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <Input
            placeholder="yourname"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {/* Email (disabled) */}
      <div className="space-y-2">
        <Label className="text-gray-300">Email</Label>
        <div className="relative">
          <Mail className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <Input
            value={email}
            disabled
            className="pl-10 cursor-not-allowed bg-white/5 border-white/10 opacity-70"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label className="text-gray-300">Password</Label>
        <div className="relative">
          <Lock className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <Input
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      <PasswordStrength password={password} />

      {/* Confirm password */}
      <div className="space-y-2">
        <Label className="text-gray-300">Confirm password</Label>
        <div className="relative">
          <Lock className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <Input
            type="password"
            placeholder="Re-enter password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={submit}
        disabled={!canSubmit || loading}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </Button>

      {/* Microcopy */}
      <p className="text-xs text-center text-gray-500">
        By creating an account, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}
