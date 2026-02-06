import React, { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import OAuthButtons from "../OAuthButtons";
import EmailSignup from "./EmailSignup";
import OtpVerification from "./OtpVerification";
import CreateAccount from "./CreateAccount";

export default function SignupPage() {
  const [step, setStep] = useState("options");
  const [email, setEmail] = useState("");

  return (
    <AuthLayout
      cardTitle="Create your free account"
      cardDescription="No credit card required. Get started in minutes."
      footerPrompt="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    >
      {step === "options" && (
        <OAuthButtons onEmailSignup={() => setStep("email")} />
      )}

      {step === "email" && (
        <EmailSignup
          onOtpSent={(email) => {
            setEmail(email);
            setStep("otp");
          }}
        />
      )}

      {step === "otp" && (
        <OtpVerification email={email} onVerified={() => setStep("create")} />
      )}

      {step === "create" && <CreateAccount email={email} />}
    </AuthLayout>
  );
}
