import { useState } from "react";
import { BellPlus, Loader2, Sparkles } from "lucide-react";

import { createAlert } from "@/services/alertsApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateAlertModal({
  applicationId,
  onClose,
  onCreated,
}) {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;

    try {
      setSaving(true);
      await createAlert({
        name,
        query,
        applicationId,
      });
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <div className="px-6 pt-6 sm:px-8 sm:pt-8">
          <div className="inline-flex rounded-2xl bg-sky-50 p-3 text-sky-700 shadow-sm">
            <BellPlus className="h-5 w-5" />
          </div>
        </div>

        <DialogHeader className="pt-2">
          <DialogTitle>Create alert</DialogTitle>
          <DialogDescription>
            Build a standout alert rule with a cleaner, more guided modal flow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 sm:px-8">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <div className="inline-flex items-center gap-2 font-medium text-slate-900">
              <Sparkles className="h-4 w-4 text-sky-600" />
              Tip
            </div>
            <p className="mt-2">Use a precise name and a focused search query so operators instantly understand why the alert exists.</p>
          </div>

          <div className="space-y-2">
            <Label>Alert name</Label>
            <Input
              placeholder="Payments failures"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-11 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label>Search query</Label>
            <Input
              placeholder='service:payments AND level:error'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 rounded-2xl"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 px-6 pb-6 sm:flex-row sm:justify-end sm:px-8 sm:pb-8">
          <Button variant="outline" className="rounded-2xl" onClick={onClose}>
            Cancel
          </Button>
          <Button className="rounded-2xl px-5" onClick={submit} disabled={saving || !name.trim()}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create alert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
