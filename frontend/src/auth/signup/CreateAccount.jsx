import { useEffect, useMemo, useRef, useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import AuthLayout from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

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
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/8">
        <motion.div className={`${color} h-2 rounded-full`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.35 }} />
      </div>
      <div className="mt-2 text-xs text-white/50">Use 10+ characters with upper/lowercase letters, numbers, and a symbol.</div>
    </div>
  );
}

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
  const sessionEmail = typeof window !== "undefined" ? sessionStorage.getItem("signup_email") : null;
  const email = emailFromState || sessionEmail;

  const usernameRef = useRef(null);

  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
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
  }, [email, emailFromState, suggested, navigate, username]);

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

  const usernameValid = username.trim().length >= 3 && /^[a-zA-Z0-9._-]{3,24}$/.test(username.trim());
  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirm && confirm.length > 0;
  const canSubmit = usernameValid && passwordValid && passwordsMatch && !loading && usernameAvailable !== false;

  const getValidationMessage = () => {
    if (!usernameValid) return "Username: 3-24 chars (letters, numbers, . _ -).";
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
      toast.success("Account created - redirecting to dashboard");
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
      cardDescription="Final step - set your credentials and enter the LogScope workspace."
      footerPrompt="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
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
                Premium account setup
              </div>
              <p className="mt-3 text-sm leading-7 text-white/72">
                Account will be created for <span className="font-medium text-white">{email}</span>. This final step now matches the elite SaaS treatment used throughout the rest of the product.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-6 md:grid-cols-12" noValidate>
          <div className="space-y-6 md:col-span-7">
            {inlineError && (
              <div className="rounded-[24px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {inlineError}
              </div>
            )}

            <Field label="Username">
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  ref={usernameRef}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 pr-28 text-white placeholder:text-white/35 focus-visible:ring-sky-400/60"
                  aria-invalid={!usernameValid || usernameAvailable === false}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                  {checkingUsername ? (
                    <span className="text-white/60">checking...</span>
                  ) : usernameAvailable === true ? (
                    <span className="flex items-center gap-1 text-emerald-400"><CheckCircle className="h-4 w-4" /> available</span>
                  ) : usernameAvailable === false ? (
                    <span className="text-rose-400">taken</span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-white/55">
                <div>Suggested: <button type="button" className="text-sky-300 hover:underline" onClick={() => setUsername(suggested)}>{suggested}</button></div>
                <div>Minimum 3 characters</div>
              </div>
            </Field>

            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  value={email}
                  disabled
                  className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 text-white/80 opacity-80"
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-white/35 focus-visible:ring-sky-400/60"
                  autoComplete="new-password"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white" onClick={() => setShowPassword((s) => !s)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </Field>

            <Field label="Confirm password">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className="h-12 rounded-2xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/35 focus-visible:ring-sky-400/60"
                  autoComplete="new-password"
                />
              </div>
            </Field>

            <Button type="submit" disabled={!canSubmit} className="h-12 w-full rounded-2xl bg-white font-medium text-slate-950 hover:bg-slate-100 disabled:opacity-60">
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-white/55">
              By creating an account you agree to our <button type="button" onClick={() => toast.info("Terms (not implemented)")} className="text-sky-300 hover:underline">Terms</button> and <button type="button" onClick={() => toast.info("Privacy (not implemented)")} className="text-sky-300 hover:underline">Privacy Policy</button>.
            </p>
          </div>

          <div className="md:col-span-5">
            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5"
            >
              <h4 className="text-base font-semibold text-white">Why create an account?</h4>
              <p className="mt-2 text-sm leading-7 text-white/70">Access the LogScope dashboard, visualize live logs, create alerts, and operate from a refined SaaS workspace.</p>

              <ul className="mt-5 space-y-4 text-sm text-white/70">
                <li className="flex gap-3"><span className="text-sky-300">•</span><div><div className="font-medium text-white">Realtime queries</div><div className="text-xs text-white/55">Search logs with fast filters and richer runtime detail.</div></div></li>
                <li className="flex gap-3"><span className="text-sky-300">•</span><div><div className="font-medium text-white">Secure by default</div><div className="text-xs text-white/55">Protected sessions, MFA-ready auth, and safer application workflows.</div></div></li>
                <li className="flex gap-3"><span className="text-sky-300">•</span><div><div className="font-medium text-white">Operator friendly</div><div className="text-xs text-white/55">A cleaner environment for alerts, analytics, and debugging.</div></div></li>
              </ul>

              <div className="mt-6 border-t border-white/8 pt-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">Password guidance</div>
                <ol className="mt-3 space-y-2 text-xs text-white/55">
                  <li>1. Use at least 10 characters whenever possible.</li>
                  <li>2. Mix uppercase, lowercase, numbers, and symbols.</li>
                  <li>3. Avoid reusing passwords across services.</li>
                </ol>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-white/78">{label}</Label>
      {children}
    </div>
  );
}
