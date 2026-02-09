import React, { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import OAuthButtons from "../OAuthButtons";
import EmailSignup from "./EmailSignup";
import OtpVerification from "./OtpVerification";

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
      {/* Step 1: OAuth or Email */}
      {step === "options" && (
        <OAuthButtons onEmailSignup={() => setStep("email")} />
      )}

      {/* Step 2: Email input */}
      {step === "email" && (
        <EmailSignup
          onOtpSent={(email) => {
            setEmail(email);
            setStep("otp");
          }}
        />
      )}

      {/* Step 3: OTP verification */}
      {step === "otp" && (
        <OtpVerification
          email={email}
                  
                  />
      )}
    </AuthLayout>
  );
}
