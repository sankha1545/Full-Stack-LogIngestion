import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Mail, Phone } from "lucide-react";

/**
 * CTA.jsx
 *
 * - Primary CTA (Create free account)
 * - Inline email capture (low friction)
 * - Secondary actions: Contact sales, Request demo
 * - Trust microcopy and small metrics row
 * - Responsive + accessible
 * - Small reveal animation (no external lib)
 */

export default function CTA() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  // small reveal on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(id);
  }, []);

  const handleEmailSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      // minimal client-side validation
      return;
    }
    setSubmitting(true);
    try {
      // Simulate an API call. Replace with real endpoint in your app.
      await new Promise((r) => setTimeout(r, 700));
      setSubmitted(true);

      // Navigate to signup with email prefilled (nice UX)
      navigate(`/signup?email=${encodeURIComponent(email)}`);
    } catch (err) {
      // handle error — show toast in real app
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="cta"
      className={`relative px-6 py-20 overflow-hidden ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } transition-all duration-600`}
      aria-labelledby="cta-heading"
    >
      {/* Ambient gradient background */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -left-20 -top-24 w-[420px] h-[420px] bg-indigo-600/10 blur-[120px]" />
        <div className="absolute right-[-120px] bottom-[-80px] w-[360px] h-[360px] bg-rose-600/6 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h2
            id="cta-heading"
            className="text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Start observing your system — without the heavy lift
          </h2>

          <p className="mt-3 text-lg text-white/70">
            Get fully set up in minutes. No credit card required · Free tier available.
          </p>
        </div>

        {/* CTA controls */}
        <div className="flex flex-col items-center gap-4 mt-8 sm:flex-row sm:justify-center">
          {/* Email capture */}
          <form
            ref={formRef}
            onSubmit={handleEmailSubmit}
            className="w-full max-w-2xl"
            aria-label="Start free account"
          >
            <div className="flex items-center gap-3">
              <label htmlFor="cta-email" className="sr-only">
                Email address
              </label>

              <input
                id="cta-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your work email — e.g. jane@company.com"
                className="flex-1 min-w-0 px-4 py-3 text-white border rounded-xl bg-white/5 border-white/8 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-required="true"
                required
              />

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-3 font-medium text-white transition shadow rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-95"
                aria-label="Create free account"
              >
                {submitting ? "Starting..." : "Create free account"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* small helper row */}
            <div className="flex items-center justify-between mt-2 text-sm text-white/60">
              <div>
                <span className="font-medium text-white">{submitted ? "✅" : ""}</span>
                <span className="ml-2">{submitted ? "Check your inbox — we sent a signup link" : "No credit card • Cancel anytime"}</span>
              </div>
              <div className="hidden sm:block">Free tier · Enterprise available</div>
            </div>
          </form>
        </div>

        {/* Secondary actions + trust */}
        <div className="flex flex-col items-center gap-4 mt-8 sm:flex-row sm:justify-center sm:gap-6">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm transition rounded-lg bg-white/5 hover:bg-white/10"
            aria-label="Contact sales"
          >
            <Phone className="w-4 h-4 text-white/80" />
            Contact sales
          </Link>

          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm transition rounded-lg bg-white/5 hover:bg-white/10"
            aria-label="Request demo"
          >
            <Mail className="w-4 h-4 text-white/80" />
            Request demo
          </Link>

          {/* small trust badges */}
          <div className="flex items-center gap-3 mt-3 text-xs text-white/60 sm:mt-0">
            <div className="px-2 py-1 rounded bg-white/3">SOC2</div>
            <div className="px-2 py-1 rounded bg-white/3">99.99% SLA</div>
            <div className="px-2 py-1 rounded bg-white/3">OTel</div>
          </div>
        </div>

        {/* micro-copy & small print */}
        <div className="mt-8 text-sm text-center text-white/50">
          <div>By signing up you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</div>
        </div>
      </div>
    </section>
  );
}
