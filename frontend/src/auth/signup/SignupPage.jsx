import React, { useState } from "react";
import { ArrowRight, Mail, ShieldCheck, Sparkles } from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import OAuthButtons from "../OAuthButtons";
import EmailSignup from "./EmailSignup";
import OtpVerification from "./OtpVerification";

export default function SignupPage() {
  const [step, setStep] = useState("options");
  const [email, setEmail] = useState("");

  return (
    <AuthLayout
      cardTitle="Create your account"
      cardDescription="Start with your preferred sign-up method and move into a polished onboarding flow."
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
                Premium onboarding
              </div>
              <p className="mt-3 text-sm leading-7 text-white/72">
                Choose the signup path that fits you best. The full account creation flow now feels cleaner, safer, and much more aligned with a classic elite SaaS product.
              </p>
            </div>
          </div>
        </div>

        {step === "options" && (
          <div className="space-y-6">
            <OAuthButtons onEmailSignup={() => setStep("email")} />

            <div className="flex items-center gap-3 text-sm text-white/40">
              <div className="h-px flex-1 bg-white/10" />
              <div className="px-2 text-[11px] uppercase tracking-[0.22em]">or use email</div>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="flex w-full items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 text-left transition hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white/8 p-3 text-sky-300">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Continue with email</div>
                  <div className="mt-1 text-xs text-white/55">Receive a verification code and complete account setup.</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-white/45" />
            </button>
          </div>
        )}

        {step === "email" && (
          <EmailSignup
            onOtpSent={(value) => {
              setEmail(value);
              setStep("otp");
            }}
          />
        )}

        {step === "otp" && <OtpVerification email={email} />}
      </div>
    </AuthLayout>
  );
}
