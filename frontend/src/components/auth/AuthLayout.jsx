import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Sparkles, ShieldCheck, BarChart3 } from "lucide-react";

/**
 * Props:
 * - cardTitle (string)
 * - cardDescription (string)
 * - children (JSX) -> placed inside the right card body
 * - footerPrompt (string) -> small prompt before footer link
 * - footerLinkText (string)
 * - footerLinkTo (string)
 * - showLeft (bool) default true
 */
export default function AuthLayout({
  cardTitle = "Welcome",
  cardDescription = "",
  children,
  footerPrompt = "Don't have an account?",
  footerLinkText = "Create one",
  footerLinkTo = "/signup",
  showLeft = true,
}) {
  return (
    <div className="min-h-screen flex bg-[#05060d] text-white">
      {/* LEFT — SUPPORTING CONTENT */}
      {showLeft && (
        <div className="hidden lg:flex w-[52%] relative px-20 py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220] via-[#0a1a2f] to-[#05060d]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.10),transparent_65%)]" />

          <div className="relative z-10 max-w-xl space-y-10">
            <div className="flex items-center gap-3 text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium tracking-wide">
                Observability made simple
              </span>
            </div>

            <h1 className="text-[44px] font-semibold leading-tight">
              Build, monitor, and scale your systems with confidence
            </h1>

            <p className="text-lg leading-relaxed text-gray-300">
              One unified platform for logs, metrics, traces, and insights —
              built for modern engineering teams.
            </p>

            <div className="pt-6 space-y-5">
              <Feature icon={BarChart3} text="Real-time metrics & dashboards" />
              <Feature
                icon={ShieldCheck}
                text="Enterprise-grade security & compliance"
              />
              <Feature icon={Sparkles} text="Generous free tier" />
            </div>
          </div>
        </div>
      )}

      {/* RIGHT — PRIMARY ACTION */}
    {/* RIGHT — PRIMARY ACTION */}
<div className="w-full lg:w-[48%] flex items-center justify-start px-8 lg:px-16 relative">
  {/* Focus glow */}
  <div className="absolute w-[420px] h-[420px] bg-indigo-500/15 rounded-full blur-3xl" />

  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className="relative z-10 w-full max-w-4xl"
  >
    <Card className="relative overflow-hidden bg-[#0b0f1a] border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.7)]">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500" />

      <CardHeader className="pt-8 space-y-2">
        <CardTitle className="text-2xl font-semibold text-white">
          {cardTitle}
        </CardTitle>
        {cardDescription && (
          <CardDescription className="text-gray-400">
            {cardDescription}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pb-8 space-y-6">
        {children}
      </CardContent>
    </Card>

    <p className="mt-6 text-sm text-center text-gray-500">
      {footerPrompt}{" "}
      <Link
        to={footerLinkTo}
        className="font-medium text-indigo-400 hover:underline"
      >
        {footerLinkText}
      </Link>
    </p>
  </motion.div>
</div>

    </div>
  );
}

/* small Feature row used in left panel */
function Feature({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 border rounded-lg bg-white/5 border-white/10">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      <span className="text-gray-200">{text}</span>
    </div>
  );
}
