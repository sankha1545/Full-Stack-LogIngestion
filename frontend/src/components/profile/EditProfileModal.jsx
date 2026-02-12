// src/components/profile/EditProfileModal.jsx

import React, { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

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

  /* =====================================================
     DETECT UNSAVED CHANGES
  ===================================================== */

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

  /* =====================================================
     LOCK BODY SCROLL
  ===================================================== */

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

  /* =====================================================
     ESC CLOSE
  ===================================================== */

  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        if (!confirmDiscard()) return;
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, confirmDiscard, onOpenChange]);

  /* =====================================================
     BASIC FOCUS TRAP
  ===================================================== */

  useEffect(() => {
    if (!open) return;

    const handleFocus = (e) => {
      if (!dialogRef.current) return;
      if (!dialogRef.current.contains(e.target)) {
        e.stopPropagation();
        dialogRef.current.focus();
      }
    };

    document.addEventListener("focus", handleFocus, true);
    return () =>
      document.removeEventListener("focus", handleFocus, true);
  }, [open]);

  if (typeof document === "undefined") return null;

  /* =====================================================
     SAVE HANDLER (FIXED)
  ===================================================== */

  const handleSaveClick = async () => {
    if (!hasChanges) {
      toast("No changes to save");
      return;
    }

    try {
      await onSave();

      // guaranteed UX flow
      toast.success("Your profile saved successfully");

      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Failed to save profile");
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
      tabIndex={-1}
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onMouseDown={() => {
          if (!confirmDiscard()) return;
          onOpenChange(false);
        }}
      />

      {/* panel */}
      <div
        className="relative z-10 w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg dark:bg-slate-900"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Edit profile
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Update your personal information. Email cannot be changed here.
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (!confirmDiscard()) return;
              onOpenChange(false);
            }}
            aria-label="Close"
          >
            ✕
          </Button>
        </div>

        {/* form */}
        <div className="mt-5">
          <ProfileForm
            values={form}
            onChange={(k, v) =>
              setForm((prev) => ({ ...prev, [k]: v }))
            }
            countries={countries}
            states={states}
            loadingCountries={loadingCountries}
            loadingStates={loadingStates}
          />
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              if (!confirmDiscard()) return;
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveClick}
            disabled={saving || !hasChanges}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );

  return open ? createPortal(content, document.body) : null;
}
