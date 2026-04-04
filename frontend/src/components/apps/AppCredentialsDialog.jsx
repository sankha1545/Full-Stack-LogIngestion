import { useState } from "react";
import { Check, Copy, KeyRound, Sparkles } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AppCredentialsDialog({
  open,
  onClose,
  apiKey,
  connectionString,
}) {
  const [copied, setCopied] = useState(null);

  async function copy(text, type) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      console.error("Copy failed");
    }
  }

  if (!apiKey && !connectionString) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
          <div className="bg-slate-950 px-6 py-8 text-white sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              One-time credentials
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight">
              Application created successfully.
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              This dialog now feels more premium and memorable while keeping
              the important action obvious: copy and store these secrets safely.
            </p>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2.5">
                  <KeyRound className="h-4 w-4 text-sky-200" />
                </div>
                <div className="text-sm leading-6 text-slate-300">
                  These values will not be shown again after you close this
                  dialog.
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <DialogHeader className="p-0">
              <DialogTitle>Secure application credentials</DialogTitle>
              <DialogDescription>
                Save these credentials securely. They will not be shown again.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {apiKey && (
                <SecretField
                  label="API Key"
                  value={apiKey}
                  copied={copied === "key"}
                  onCopy={() => copy(apiKey, "key")}
                />
              )}

              {connectionString && (
                <SecretField
                  label="Connection String"
                  value={connectionString}
                  copied={copied === "conn"}
                  onCopy={() => copy(connectionString, "conn")}
                />
              )}

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Recommended: copy both values now and store them in your team’s
                secret manager before closing.
              </div>

              <Button className="w-full rounded-2xl" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SecretField({ label, value, copied, onCopy }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-900">{label}</p>
      <div className="flex items-center overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <input
          readOnly
          value={value}
          className="flex-1 bg-transparent px-4 py-3 text-sm outline-none"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="m-1 rounded-2xl"
          onClick={onCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
