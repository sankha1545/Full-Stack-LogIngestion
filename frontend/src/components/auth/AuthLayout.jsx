import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BarChart3, ShieldCheck, Sparkles, Zap } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
    <div className="min-h-screen bg-[#050913] text-white">
      <div className="relative flex min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.16),transparent_30%)]" />

        {showLeft && (
          <div className="relative hidden w-[52%] lg:flex px-20 py-24">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1220] via-[#071a31] to-[#050913]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_55%)]" />

            <div className="relative z-10 max-w-xl space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-sky-200">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium tracking-wide">Elite SaaS authentication</span>
              </div>

              <div>
                <h1 className="text-[48px] font-semibold leading-[1.05] tracking-tight">
                  Secure access for teams who run critical systems.
                </h1>
                <p className="mt-6 text-lg leading-8 text-slate-300">
                  LogScope wraps security, observability, and polished product design into one modern workspace built for operators and engineering teams.
                </p>
              </div>

              <div className="grid gap-4">
                <Feature icon={BarChart3} title="Operational visibility" text="Move from authentication into live logs, analytics, and application detail without friction." />
                <Feature icon={ShieldCheck} title="Security first" text="Sessions, MFA, and protected workflows stay front and center in a cleaner premium auth flow." />
                <Feature icon={Zap} title="Faster onboarding" text="The auth journey is more guided, more elegant, and easier to trust at every step." />
              </div>
            </div>
          </div>
        )}

        <div className="relative flex w-full items-center justify-center px-6 py-10 lg:w-[48%] lg:px-16">
          <div className="absolute h-[420px] w-[420px] rounded-full bg-sky-500/12 blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative z-10 w-full max-w-3xl"
          >
            <Card className="relative overflow-hidden border border-white/10 bg-[#0b1220]/90 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-500" />
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_70%)]" />

              <CardHeader className="space-y-3 pt-8">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/90">
                  Secure access
                </div>
                <CardTitle className="text-3xl font-semibold text-white tracking-tight">
                  {cardTitle}
                </CardTitle>
                {cardDescription && (
                  <CardDescription className="max-w-xl text-sm leading-7 text-slate-400">
                    {cardDescription}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-6 pb-8">
                {children}
              </CardContent>
            </Card>

            <p className="mt-6 text-sm text-center text-slate-500">
              {footerPrompt}{" "}
              <Link to={footerLinkTo} className="font-medium text-sky-300 hover:text-sky-200 hover:underline">
                {footerLinkText}
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-white/10 p-3 text-sky-300 ring-1 ring-white/10">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm leading-6 text-slate-300">{text}</div>
        </div>
      </div>
    </div>
  );
}
