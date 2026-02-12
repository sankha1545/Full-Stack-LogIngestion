// src/components/apps/CreateAppDialog.jsx

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createApp } from "@/api/appsApi";

/**
 * =====================================================
 * Create Application Dialog (SaaS Form)
 * =====================================================
 *
 * Props:
 * - open
 * - onClose
 * - onCreated(result)
 *
 * Handles:
 * - application creation
 * - validation
 * - connection string flow
 */

export default function CreateAppDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("DEVELOPMENT");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =====================================================
     RESET FORM WHEN OPENED
  ===================================================== */

  useEffect(() => {
    if (open) {
      setName("");
      setEnvironment("DEVELOPMENT");
      setError(null);
    }
  }, [open]);

  /* =====================================================
     CREATE APP
  ===================================================== */

  async function handleCreate() {
    if (!name.trim()) {
      setError("Application name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await createApp({
        name: name.trim(),
        environment,
      });

      /**
       * Backend returns:
       * {
       *  id,
       *  apiKey,
       *  connectionString
       * }
       */

      onCreated?.(res.data);
      onClose?.();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4">

        <DialogHeader>
          <DialogTitle>Create Application</DialogTitle>
        </DialogHeader>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}

        {/* App Name */}
        <Input
          placeholder="Application name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        {/* Environment */}
        <select
          value={environment}
          onChange={(e) => setEnvironment(e.target.value)}
          disabled={loading}
          className="w-full p-2 border rounded-md"
        >
          <option value="DEVELOPMENT">Development</option>
          <option value="STAGING">Staging</option>
          <option value="PRODUCTION">Production</option>
        </select>

        {/* Submit */}
        <Button
          onClick={handleCreate}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Creating..." : "Create Application"}
        </Button>

      </DialogContent>
    </Dialog>
  );
}
