import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EmailSignup({ onOtpSent }) {
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = () => {
    if (!email) return;
    setTimer(30);
    onOtpSent(email);
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">
          Verify your email
        </h3>
        <p className="text-sm text-gray-400">
          We’ll send a one-time verification code to your email.
        </p>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">
          Email address
        </label>

        <div className="relative">
          <Mail className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />

          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {/* Action */}
      <Button
        onClick={sendOtp}
        disabled={!email || timer > 0}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60"
      >
        {timer > 0 ? `Resend in ${timer}s` : "Send verification code"}
      </Button>

      {/* Microcopy */}
      <p className="text-xs text-gray-500">
        By continuing, you agree to receive emails related to account verification.
      </p>
    </div>
  );
}
