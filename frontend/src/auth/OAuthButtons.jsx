import React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const BACKEND_URL = "http://localhost:3001";

export default function OAuthButtons({ onEmailSignup }) {
  /* ----------------------------------------
     OAuth redirects (ALWAYS backend)
  ---------------------------------------- */
  const handleGoogle = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  const handleGithub = () => {
    window.location.href = `${BACKEND_URL}/api/auth/github`;
  };

  return (
    <div className="space-y-4">
      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="flex items-center w-full gap-3 h-11 border-white/10 bg-white/5 hover:bg-white/10"
        onClick={handleGoogle}
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5"
        />
        <span className="text-sm font-medium text-white">
          Continue with Google
        </span>
      </Button>

      {/* GitHub */}
      <Button
        type="button"
        variant="outline"
        className="flex items-center w-full gap-3 h-11 border-white/10 bg-white/5 hover:bg-white/10"
        onClick={handleGithub}
      >
        <img
          src="https://www.svgrepo.com/show/512317/github-142.svg"
          alt="GitHub"
          className="w-5 h-5 invert"
        />
        <span className="text-sm font-medium text-white">
          Continue with GitHub
        </span>
      </Button>

      {/* Email signup */}
      {onEmailSignup && (
        <>
          <div className="relative py-2">
            <Separator className="bg-white/10" />
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-[#0b0f1a] px-2 text-xs text-gray-400">
              or
            </span>
          </div>

          <Button
            type="button"
            onClick={onEmailSignup}
            className="flex items-center w-full gap-3 font-medium text-white bg-indigo-500 h-11 hover:bg-indigo-600"
          >
            <Mail className="w-4 h-4" />
            Continue with Email
          </Button>
        </>
      )}
    </div>
  );
}
