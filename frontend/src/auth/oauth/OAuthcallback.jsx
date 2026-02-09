import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      toast.error("OAuth failed. No token received.");
      navigate("/login");
      return;
    }

    // Save token (AuthContext)
    login(token);

    toast.success("Signed in successfully 🎉");

    // Redirect to dashboard
    navigate("/dashboard", { replace: true });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      <div className="space-y-3 text-center">
        <div className="text-lg font-medium">Signing you in…</div>
        <div className="text-sm text-white/60">
          Please wait while we complete authentication
        </div>
      </div>
    </div>
  );
}
