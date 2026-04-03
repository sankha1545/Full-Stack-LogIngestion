import React, { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { PencilLine, Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import ProfileForm from "./ProfileForm";
import useUnsavedChanges from "./useUnsavedChanges";

export default function EditProfileModal({
  open,
  onOpenChange,
  form,
  setForm,
  onSave,
  saving,
  countries = [],
  states = [],
  loadingCountries = false,
  loadingStates = false,
  originalValues = {},
}) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  const hasChanges = useMemo(() => {
    const a = {
      firstName: originalValues?.firstName || "",
      lastName: originalValues?.lastName || "",
      username: originalValues?.username || "",
      countryCode: originalValues?.countryCode || "",
      state: originalValues?.state || "",
    };

    const b = {
      firstName: form?.firstName || "",
      lastName: form?.lastName || "",
      username: form?.username || "",
      countryCode: form?.countryCode || "",
      state: form?.state || "",
    };

    return JSON.stringify(a) !== JSON.stringify(b);
  }, [form, originalValues]);

  const { confirmDiscard } = useUnsavedChanges(hasChanges);

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      document.body.style.overflow = "hidden";
      setTimeout(() => dialogRef.current?.focus?.(), 0);
    } else {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape") {
        if (!confirmDiscard()) return;
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, confirmDiscard, onOpenChange]);

  useEffect(() => {
    if (!open) return;

    const handleFocus = (event) => {
      if (!dialogRef.current) return;
      if (!dialogRef.current.contains(event.target)) {
        event.stopPropagation();
        dialogRef.current.focus();
      }
    };

    document.addEventListener("focus", handleFocus, true);
    return () => document.removeEventListener("focus", handleFocus, true);
  }, [open]);

  if (typeof document === "undefined") return null;

  const handleSaveClick = async () => {
    if (!hasChanges) {
      toast("No changes to save");
      return;
    }

    try {
      await onSave();
      toast.success("Your profile saved successfully");
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save profile");
    }
  };

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
      tabIndex={-1}
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-950/72 backdrop-blur-md"
        onMouseDown={() => {
          if (!confirmDiscard()) return;
          onOpenChange(false);
        }}
      />

      <div
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,255,0.97))] shadow-[0_40px_120px_rgba(15,23,42,0.24)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="bg-slate-950 px-6 py-8 text-white sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
              <Sparkles className="h-3.5 w-3.5" />
              Profile editing
            </div>
            <h3 className="mt-5 text-2xl font-semibold tracking-tight">Make profile changes in a modal that actually feels special.</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Cleaner layout, stronger hierarchy, and safer dismiss behavior give this workflow a much more polished feel.
            </p>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
              Unsaved changes are protected, and updates stay in clear view while you edit.
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex rounded-2xl bg-sky-50 p-3 text-sky-700 shadow-sm">
                  <PencilLine className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-950">Edit profile</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Update your personal information. Email cannot be changed here.
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-2xl"
                onClick={() => {
                  if (!confirmDiscard()) return;
                  onOpenChange(false);
                }}
                aria-label="Close"
              >
                ×
              </Button>
            </div>

            <div className="mt-6">
              <ProfileForm
                values={form}
                onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
                countries={countries}
                states={states}
                loadingCountries={loadingCountries}
                loadingStates={loadingStates}
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => {
                  if (!confirmDiscard()) return;
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>

              <Button className="rounded-2xl px-5" onClick={handleSaveClick} disabled={saving || !hasChanges}>
                {saving ? "Saving..." : "Save changes"}
                {!saving && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return open ? createPortal(content, document.body) : null;
}
