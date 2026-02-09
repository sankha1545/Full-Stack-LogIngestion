// src/auth/signup/CreateAccount.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import AuthLayout from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

/* small in-file password score & UI */
function getPasswordScore(password = "") {
  let score = 0;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { label: "Weak", pct: 33, color: "bg-rose-500" };
  if (score === 3) return { label: "Medium", pct: 66, color: "bg-amber-500" };
  return { label: "Strong", pct: 100, color: "bg-emerald-500" };
}
function PasswordStrength({ password }) {
  if (!password) return null;
  const { label, pct, color } = getPasswordScore(password);
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-white/70">
        <div className="font-medium">{label}</div>
        <div className="text-white/50">{password.length} chars</div>
      </div>
      <div className="w-full h-2 mt-2 overflow-hidden rounded-full bg-white/6">
        <motion.div
          className={`${color} h-2 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35 }}
        />
      </div>
      <div className="mt-2 text-xs text-white/50">
        Tip: Prefer 10+ characters with upper/lower, digits and a symbol.
      </div>
    </div>
  );
}

/* debounce helper */
function debounce(fn, wait = 400) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export default function CreateAccount() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email;
  const sessionEmail =
    typeof window !== "undefined" ? sessionStorage.getItem("signup_email") : null;
  const email = emailFromState || sessionEmail;

  const usernameRef = useRef(null);

  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null / true / false
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState("");

  const suggested = useMemo(() => {
    if (!email) return "";
    const local = (email.split("@")[0] || "").toLowerCase();
    return local.replace(/[^a-z0-9._-]/gi, "").slice(0, 24);
  }, [email]);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!email) {
      navigate("/signup", { replace: true });
      return;
    }
    if (emailFromState) sessionStorage.setItem("signup_email", emailFromState);
    if (!username && suggested) {
      setUsername(suggested);
      setTimeout(() => usernameRef.current?.focus?.(), 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, emailFromState, suggested, navigate]);

  /* username availability (optional endpoint) */
  const checkUsernameRemote = async (q) => {
    if (!q || q.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/auth/check-username?username=${encodeURIComponent(q)}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        setUsernameAvailable(null);
      } else {
        const data = await res.json();
        setUsernameAvailable(Boolean(data.available));
      }
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };
  const debouncedCheck = useMemo(() => debounce(checkUsernameRemote, 450), []);
  useEffect(() => {
    if (username && username.trim().length >= 3) debouncedCheck(username.trim());
    else setUsernameAvailable(null);
  }, [username, debouncedCheck]);

  const usernameValid =
    username.trim().length >= 3 && /^[a-zA-Z0-9._-]{3,24}$/.test(username.trim());
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirm && confirm.length > 0;
  const canSubmit =
    usernameValid && passwordValid && passwordsMatch && !loading && usernameAvailable !== false;

  const getValidationMessage = () => {
    if (!usernameValid) return "Username: 3–24 chars (letters, numbers, . _ -).";
    if (usernameAvailable === false) return "This username is already taken.";
    if (!passwordValid) return "Password must be at least 8 characters.";
    if (!passwordsMatch) return "Passwords do not match.";
    return "";
  };

  const submit = async (e) => {
    if (e) e.preventDefault();
    setInlineError("");
    const validation = getValidationMessage();
    if (validation) {
      setInlineError(validation);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          username: username.trim(),
          password,
        }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned invalid response.");
      }
      if (!res.ok) throw new Error(data.error || "Signup failed. Try again.");
      login(data.token);
      sessionStorage.removeItem("signup_email");
      toast.success("Account created — redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.message || "Signup failed";
      setInlineError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <AuthLayout
      cardTitle="Create your free account"
      cardDescription="Final step — make your LogScope account. No credit card required."
      footerPrompt="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    >
      <form onSubmit={submit} className="grid gap-6 md:grid-cols-12" noValidate>
        <div className="space-y-6 md:col-span-7">
          <div>
            <h2 className="text-xl font-semibold text-white">Set up your account</h2>
            <p className="mt-1 text-sm text-white/70">
              Account will be created for <span className="font-medium text-white">{email}</span>
            </p>
          </div>

          {inlineError && (
            <div className="px-3 py-2 text-sm border rounded-md text-rose-300 bg-rose-900/20 border-rose-800/40">
              {inlineError}
            </div>
          )}

          {/* username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white/80">Username</Label>
            <div className="relative">
              <User className="absolute w-4 h-4 text-black -translate-y-1/2 left-3 top-1/2" />
              <Input
                id="username"
                ref={usernameRef}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-username"
                className="pl-10 text-black border pr-28 bg-white/3 border-white/8 placeholder-white/50 focus:ring-2 focus:ring-indigo-500"
                aria-invalid={!usernameValid || usernameAvailable === false}
              />
              <div className="absolute text-sm -translate-y-1/2 right-3 top-1/2">
                {checkingUsername ? (
                  <span className="text-white/60">checking…</span>
                ) : usernameAvailable === true ? (
                  <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-4 h-4" /> available</span>
                ) : usernameAvailable === false ? (
                  <span className="text-rose-400">taken</span>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-white/60">
              <div>Suggested: <button type="button" className="underline" onClick={() => setUsername(suggested)}>{suggested}</button></div>
              <div>Minimum 3 characters</div>
            </div>
          </div>

          {/* email */}
          <div className="space-y-2">
            <Label className="text-white/80">Email</Label>
            <div className="relative">
              <Mail className="absolute w-4 h-4 -translate-y-1/2 text-white/60 left-3 top-1/2" />
              <Input
                value={email}
                disabled
                className="pl-10 text-white border cursor-not-allowed bg-white/3 border-white/8 placeholder-white/50 opacity-80"
              />
            </div>
          </div>

          {/* password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <div className="relative">
              <Lock className="absolute w-4 h-4 text-black -translate-y-1/2 left-3 top-1/2" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="pl-10 pr-10 text-black border bg-white/3 border-white/8 placeholder-white/50 focus:ring-2 focus:ring-indigo-500"
                autoComplete="new-password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute -translate-y-1/2 right-3 top-1/2"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-black" /> : <Eye className="w-4 h-4 text-black" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* confirm */}
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-white/80">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute w-4 h-4 text-black -translate-y-1/2 left-3 top-1/2" />
              <Input
                id="confirm"
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                className="pl-10 text-black border bg-white/3 border-white/8 placeholder-white/50 focus:ring-2 focus:ring-indigo-500"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-500"
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>

            <p className="mt-3 text-xs text-center text-white/60">
              By creating an account you agree to our{" "}
              <button type="button" onClick={() => toast.info("Terms (not implemented)")} className="underline">Terms</button>{" "}
              and <button type="button" onClick={() => toast.info("Privacy (not implemented)")} className="underline">Privacy Policy</button>.
            </p>
          </div>
        </div>

        <div className="md:col-span-5">
          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}
            className="p-5 border rounded-lg border-white/8 bg-gradient-to-b from-white/3 to-white/2">
            <h4 className="text-sm font-semibold text-white">Why create an account?</h4>
            <p className="mt-2 text-sm text-white/70">Access the LogScope dashboard — visualize logs, create alerts, and collaborate.</p>

            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex gap-3"><span className="text-indigo-400">•</span> <div><div className="font-medium text-white">Realtime queries</div><div className="text-xs text-white/60">Search logs with lightning-fast filters</div></div></li>
              <li className="flex gap-3"><span className="text-indigo-400">•</span> <div><div className="font-medium text-white">Secure by default</div><div className="text-xs text-white/60">HttpOnly cookies, RBAC-friendly, exportable pipelines</div></div></li>
              <li className="flex gap-3"><span className="text-indigo-400">•</span> <div><div className="font-medium text-white">Developer friendly</div><div className="text-xs text-white/60">OTel-compatible templates & runbooks</div></div></li>
            </ul>

            <div className="pt-3 mt-6 border-t border-white/6">
              <div className="text-xs text-white/60">Password guidelines</div>
              <ol className="mt-2 space-y-1 text-xs list-decimal list-inside text-white/60">
                <li>At least 10 characters recommended</li>
                <li>Combine upper/lower, numbers & symbols</li>
                <li>Avoid reused passwords</li>
              </ol>
            </div>
          </motion.div>
        </div>
      </form>
    </AuthLayout>
  );
}
