import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Loader2, ShieldCheck, Copy } from "lucide-react";

export default function MFASetup({ onClose }) {
const { token, refreshUser } = useAuth(); // ⭐ CRITICAL FIX
const API_URL = import.meta.env.VITE_API_URL;

const [qr, setQr] = useState(null);
const [secret, setSecret] = useState(null);
const [code, setCode] = useState("");

const [loading, setLoading] = useState(false);
const [verifying, setVerifying] = useState(false);
const [recoveryCodes, setRecoveryCodes] = useState(null);

/* =========================================
STEP 1 — START SETUP
========================================= */

useEffect(() => {
if (!token) return;


async function startSetup() {
  try {
    setLoading(true);

    const res = await fetch(
      `${API_URL}/api/auth/mfa/setup`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    const body = await res.json();

    if (!res.ok) {
      toast.error(body.error || "Failed to start MFA setup");
      return;
    }

    setQr(body.qr);
    setSecret(body.secret);

  } catch {
    toast.error("Failed to initialize MFA");
  } finally {
    setLoading(false);
  }
}

startSetup();


}, [token, API_URL]);

/* =========================================
STEP 2 — VERIFY SETUP
========================================= */

async function verifySetup(e) {
e.preventDefault();
if (verifying) return;


try {
  setVerifying(true);

  const res = await fetch(
    `${API_URL}/api/auth/mfa/verify-setup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ code }),
    }
  );

  const body = await res.json();

  if (!res.ok) {
    toast.error(body.error || "Verification failed");
    return;
  }

  setRecoveryCodes(body.recoveryCodes);

  /* ⭐ CRITICAL FIX — sync AuthContext */
  await refreshUser();

  toast.success("MFA enabled successfully");

} catch {
  toast.error("Verification failed");
} finally {
  setVerifying(false);
}


}

/* =========================================
COPY RECOVERY CODES
========================================= */

function copyRecoveryCodes() {
navigator.clipboard.writeText(recoveryCodes.join("\n"));
toast.success("Recovery codes copied");
}

/* =========================================
UI
========================================= */

return ( <div className="w-full max-w-lg p-6 space-y-6 border rounded-2xl bg-white/5 border-white/10 backdrop-blur">

```
  <div className="text-center">
    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
    <h2 className="text-lg font-semibold text-white">
      Set up multi-factor authentication
    </h2>
    <p className="text-sm text-white/50">
      Use Google Authenticator or similar app
    </p>
  </div>

  {loading && (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
    </div>
  )}

  {!loading && !recoveryCodes && (
    <>
      {qr && (
        <div className="flex justify-center">
          <img
            src={qr}
            alt="MFA QR"
            className="w-56 h-56 p-2 bg-white rounded-lg"
          />
        </div>
      )}

      {secret && (
        <div className="text-xs text-center text-white/40">
          Manual entry code:{" "}
          <span className="font-mono text-white/70">
            {secret}
          </span>
        </div>
      )}

      <form onSubmit={verifySetup} className="space-y-4">
        <Input
          type="text"
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={8}
          disabled={verifying}
          className="text-lg tracking-widest text-center bg-white/5 border-white/10"
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={verifying}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify & Enable"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </form>
    </>
  )}

  {recoveryCodes && (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
        <p className="text-sm text-yellow-300">
          Save these recovery codes securely. Each can be used once.
        </p>
      </div>

      <div className="p-4 font-mono text-sm border rounded-lg bg-black/50 border-white/10">
        {recoveryCodes.map((code, i) => (
          <div key={i}>{code}</div>
        ))}
      </div>

      <Button
        onClick={copyRecoveryCodes}
        className="w-full"
        variant="secondary"
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy recovery codes
      </Button>

      <Button
        onClick={onClose}
        className="w-full bg-indigo-600 hover:bg-indigo-500"
      >
        Done
      </Button>
    </div>
  )}
</div>


);
}
