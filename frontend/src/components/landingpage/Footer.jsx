import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  Github,
  Twitter,
  Mail,
  Linkedin,
  ExternalLink
} from "lucide-react";

/**
 * Footer.jsx
 *
 * - Responsive, accessible footer with:
 *   Brand block, Quick Links, Resources, Legal + Newsletter
 * - Client-side newsletter capture (local state)
 * - Back-to-top floating button
 * - Tailwind + lucide-react (no extra deps)
 *
 * Install lucide-react if missing:
 *   npm install lucide-react
 */

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "ok" | "error"
  const year = new Date().getFullYear();

  function validateEmail(e) {
    // simple regex — good enough for UI-side validation
    return /^\S+@\S+\.\S+$/.test(e);
  }

  function handleSubscribe(ev) {
    ev.preventDefault();
    setStatus(null);
    if (!validateEmail(email)) {
      setStatus("error");
      return;
    }

    // Demo: store in localStorage (replace with API call)
    try {
      const list = JSON.parse(localStorage.getItem("ls_news") || "[]");
      if (!list.includes(email)) {
        list.push(email);
        localStorage.setItem("ls_news", JSON.stringify(list));
      }
      setStatus("ok");
      setEmail("");
    } catch (err) {
      setStatus("error");
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {/* Optional slim CTA stripe */}
      <div className="w-full text-white bg-gradient-to-r from-indigo-600 to-purple-500">
        <div className="flex flex-col gap-3 px-6 py-3 mx-auto max-w-7xl sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold">
            Get started with LogScope — centralized logs, real-time insights.
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 transition rounded-md bg-white/10 hover:bg-white/20"
            >
              Create free account
              <ExternalLink className="w-4 h-4" />
            </Link>

            <Link
              to="/contact"
              className="px-3 py-2 text-sm transition rounded-md bg-white/5 hover:bg-white/10"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <footer
        aria-labelledby="footer-heading"
        className="px-6 pt-12 pb-10 text-white bg-slate-900"
      >
        <div className="mx-auto max-w-7xl">
          <h2 id="footer-heading" className="sr-only">
            LogScope footer
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand / description / socials */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600/20 ring-1 ring-indigo-500/40">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M3 12h18M12 3v18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-bold">LogScope</div>
                  <div className="text-sm text-white/70">Observability for modern apps</div>
                </div>
              </div>

              <p className="max-w-sm text-sm text-white/70">
                Centralized log ingestion, fast queries, and secure role-based access — built for engineers and teams.
              </p>

              <div className="flex items-center gap-3 mt-1">
                <a
                  href="https://github.com"
                  aria-label="LogScope on GitHub"
                  className="p-2 transition rounded hover:bg-white/5"
                >
                  <Github className="w-5 h-5 text-white/80" />
                </a>

                <a
                  href="https://twitter.com"
                  aria-label="LogScope on Twitter"
                  className="p-2 transition rounded hover:bg-white/5"
                >
                  <Twitter className="w-5 h-5 text-white/80" />
                </a>

                <a
                  href="mailto:hello@example.com"
                  aria-label="Email LogScope"
                  className="p-2 transition rounded hover:bg-white/5"
                >
                  <Mail className="w-5 h-5 text-white/80" />
                </a>

                <a
                  href="https://www.linkedin.com"
                  aria-label="LogScope on LinkedIn"
                  className="p-2 transition rounded hover:bg-white/5"
                >
                  <Linkedin className="w-5 h-5 text-white/80" />
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <div className="mb-3 font-semibold">Quick links</div>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link to="/docs" className="transition hover:text-white">Documentation</Link>
                </li>
                <li>
                  <Link to="/dashboard" className="transition hover:text-white">Dashboard</Link>
                </li>
                <li>
                  <Link to="/integrations" className="transition hover:text-white">Integrations</Link>
                </li>
                <li>
                  <Link to="/pricing" className="transition hover:text-white">Pricing</Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <div className="mb-3 font-semibold">Resources</div>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link to="/tutorials" className="transition hover:text-white">Tutorials</Link>
                </li>
                <li>
                  <Link to="/use-cases" className="transition hover:text-white">Use cases</Link>
                </li>
                <li>
                  <a href="/demo" className="transition hover:text-white">Interactive demo</a>
                </li>
                <li>
                  <a href="/blog" className="transition hover:text-white">Blog</a>
                </li>
              </ul>
            </div>

            {/* Newsletter + legal */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-3 font-semibold">Get updates</div>

                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <label htmlFor="footer-email" className="sr-only">Email</label>
                  <input
                    id="footer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-3 py-2 text-white border rounded-md bg-white/5 border-white/8 placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    aria-describedby="footer-newsnote"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm transition bg-indigo-600 rounded-md hover:bg-indigo-500"
                  >
                    Subscribe
                  </button>
                </form>

                <div id="footer-newsnote" className="mt-2 text-sm">
                  {status === "ok" && (
                    <span role="status" className="text-sm text-emerald-400">Thanks — you're subscribed!</span>
                  )}
                  {status === "error" && (
                    <span role="alert" className="text-sm text-rose-400">Please enter a valid email.</span>
                  )}
                  {status === null && (
                    <span className="text-sm text-white/60">No spam. Unsubscribe anytime.</span>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-6 text-sm border-t border-white/6 text-white/60">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link to="/terms" className="transition hover:text-white">Terms</Link>
                    <span className="mx-2">•</span>
                    <Link to="/privacy" className="transition hover:text-white">Privacy</Link>
                  </div>

                  <div className="mt-2 text-xs text-white/50 sm:mt-0">
                    © {year} LogScope · Built for developers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to top floating button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className="fixed z-50 flex items-center gap-2 p-3 transition rounded-full right-6 bottom-6 bg-white/6 backdrop-blur hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <ArrowUp className="w-5 h-5 text-white/90" />
      </button>
    </>
  );
}
