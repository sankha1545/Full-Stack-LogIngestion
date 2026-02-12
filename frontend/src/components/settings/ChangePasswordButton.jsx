import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import VerifyPasswordModal from "@/components/Modal/VerifyPasswordModal";
import ChangePasswordModal from "@/components/Modal/ChangePasswordModal";
import Spinner from "@/components/ui/Spinner";

export default function ChangePasswordButton() {
  const [step, setStep] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loadingProvider, setLoadingProvider] = useState(true);

  /* =====================================================
     FETCH AUTH PROVIDER
     (email vs google/github)
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    async function fetchProvider() {
      try {
        setLoadingProvider(true);

        const res = await fetch("/api/profile/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();

        if (mounted) {
          setProvider(data?.account?.provider || "credentials");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load account info");
      } finally {
        if (mounted) setLoadingProvider(false);
      }
    }

    fetchProvider();

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     LOADING STATE
  ===================================================== */

  if (loadingProvider) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner size={16} />
        Checking account...
      </div>
    );
  }

  /* =====================================================
     OAUTH USERS → NO PASSWORD CHANGE
  ===================================================== */

  if (provider !== "credentials") {
    return (
      <p className="text-sm text-muted-foreground">
        Password change not available for OAuth accounts.
      </p>
    );
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      <button
        className="btn-outline"
        onClick={() => setStep("verify")}
      >
        Change Password
      </button>

      {/* Step 1: Verify Password */}
      {step === "verify" && (
        <VerifyPasswordModal
          onSuccess={() => setStep("change")}
          onClose={() => setStep(null)}
        />
      )}

      {/* Step 2: Change Password */}
      {step === "change" && (
        <ChangePasswordModal onClose={() => setStep(null)} />
      )}
    </>
  );
}
