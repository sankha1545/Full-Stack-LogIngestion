import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function OtpVerification({ email, onVerified }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    // Move forward
    if (value && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move backward on backspace
    if (e.key === "Backspace" && !otp[index] && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d{4}$/.test(pasted)) return;

    const values = pasted.split("");
    setOtp(values);

    // Focus last input
    inputsRef.current[3]?.focus();
  };

  const isComplete = otp.every((d) => d !== "");

const verifyOtp = async () => {
  if (!isComplete) return;

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          code: otp.join(""),
        }),
      }
    );

    // 👇 SAFELY read response
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      alert(data.error || "Invalid or expired OTP");
      return;
    }

    if (data.verified) {
      onVerified(); // move to CreateAccount
    }
  } catch (err) {
    console.error("OTP verify failed:", err);
    alert("Unable to verify OTP. Please try again.");
  }
};




  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h3 className="text-lg font-semibold">Verify your email</h3>
        <p className="text-sm text-gray-400">
          Enter the 4-digit code sent to{" "}
          <span className="font-medium text-white">{email}</span>
        </p>
      </div>

      {/* OTP Inputs */}
      <div
        className="flex justify-center gap-3"
        onPaste={handlePaste}
      >
        {otp.map((value, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-lg font-semibold text-center text-white border rounded-lg border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ))}
      </div>

      {/* Verify Button */}
      <Button
        onClick={verifyOtp}
        disabled={!isComplete}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60"
      >
        Verify code
      </Button>

      {/* Help text */}
      <p className="text-xs text-center text-gray-500">
        Didn’t receive the code? Check your spam folder or try again.
      </p>
    </div>
  );
}
