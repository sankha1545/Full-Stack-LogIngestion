// src/components/ui/ConfirmDialog.jsx

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Reusable confirmation dialog
 */

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="px-6 pt-6 sm:px-8 sm:pt-8">
          <div className="inline-flex rounded-2xl bg-rose-50 p-3 text-rose-600 shadow-sm">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <DialogHeader className="pt-2">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <DialogDescription>{description}</DialogDescription>

        <DialogFooter className="gap-2">
          <Button variant="outline" className="rounded-2xl" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="destructive" className="rounded-2xl px-5" onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
