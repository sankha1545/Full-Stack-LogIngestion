import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login, setTempMfaSession, clearTempMfaSession } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = params.get("token");
    const mfaRequired = params.get("mfaRequired");
    const tempToken = params.get("tempToken");

    /* ================= NORMAL LOGIN ================= */
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        const userData = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        };

        clearTempMfaSession();
        login(token, userData);

        toast.success("Login successful 🎉");
        navigate("/dashboard", { replace: true });
        return;

      } catch (err) {
        console.error("Token decode failed:", err);
      }
    }

    /* ================= MFA REQUIRED ================= */
    if (mfaRequired === "true" && tempToken) {
      setTempMfaSession({
        tempToken,
        provider: "oauth",
      });

      toast("Multi-factor authentication required", {
        icon: "🔐",
      });

      navigate("/mfa-verify", { replace: true });
      return;
    }

    /* ================= FAILURE ================= */
    toast.error("Authentication failed");
    navigate("/login", { replace: true });

  }, [params, login, navigate, setTempMfaSession, clearTempMfaSession]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-sm text-white/60 animate-pulse">
        Completing authentication…
      </div>
    </div>
  );
}
