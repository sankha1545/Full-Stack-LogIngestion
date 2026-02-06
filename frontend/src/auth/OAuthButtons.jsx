import React from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * Props:
 * - onEmailSignup (fn) optional -> used by signup flow
 * - onGoogle (fn) optional -> handler for google sign-in
 * - onGithub (fn) optional -> handler for github sign-in
 */
export default function OAuthButtons({ onEmailSignup, onGoogle, onGithub }) {
  return (
    <div className="space-y-4">
      {/* Google */}
      <Button
        variant="outline"
        className="flex items-center w-full gap-3 transition h-11 border-white/10 bg-white/5 hover:bg-white/10"
        onClick={onGoogle}
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5"
        />
        <span className="text-sm font-medium text-white">Continue with Google</span>
      </Button>

      {/* GitHub */}
      <Button
        variant="outline"
        className="flex items-center w-full gap-3 transition h-11 border-white/10 bg-white/5 hover:bg-white/10"
        onClick={onGithub}
      >
        <img
          src="https://www.svgrepo.com/show/512317/github-142.svg"
          alt="GitHub"
          className="w-5 h-5 invert"
        />
        <span className="text-sm font-medium text-white">Continue with GitHub</span>
      </Button>

      {/* Divider */}
      <div className="relative py-2">
        <Separator className="bg-white/10" />
        <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-[#0b0f1a] px-2 text-xs text-gray-400">
          or
        </span>
      </div>

      {/* Email CTA */}
      {onEmailSignup ? (
        <Button
          onClick={onEmailSignup}
          className="flex items-center w-full gap-3 font-medium text-white bg-indigo-500 h-11 hover:bg-indigo-600"
        >
          <Mail className="w-4 h-4" />
          Continue with Email
        </Button>
      ) : null}
    </div>
  );
}
