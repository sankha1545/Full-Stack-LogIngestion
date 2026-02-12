// src/components/apps/AppCredentialsDialog.jsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

/**
 * =====================================================
 * Application Credentials Modal (Fixed Layout)
 * =====================================================
 */

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
      <DialogContent className="p-6 sm:max-w-2xl">

        <DialogHeader>
          <DialogTitle>
            Application Created Successfully 🎉
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Save these credentials securely. They will not be shown again.
        </p>

        <div className="space-y-6">

          {/* API KEY */}
          {apiKey && (
            <div className="space-y-2">
              <p className="text-sm font-medium">API Key</p>

              <div className="flex items-center w-full overflow-hidden border rounded-md">
                <input
                  readOnly
                  value={apiKey}
                  className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                />

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="border-l rounded-none"
                  onClick={() => copy(apiKey, "key")}
                >
                  {copied === "key" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* CONNECTION STRING */}
          {connectionString && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Connection String
              </p>

              <div className="flex items-center w-full overflow-hidden border rounded-md">
                <input
                  readOnly
                  value={connectionString}
                  className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                />

                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="border-l rounded-none"
                  onClick={() => copy(connectionString, "conn")}
                >
                  {copied === "conn" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <Button className="w-full mt-4" onClick={onClose}>
            Done
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
