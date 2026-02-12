// src/components/profile/useUnsavedChanges.js
import { useEffect, useCallback } from "react";

export default function useUnsavedChanges(hasChanges) {
  useEffect(() => {
    const handler = (e) => {
      if (!hasChanges) return;
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  const confirmDiscard = useCallback(() => {
    if (!hasChanges) return true;
    return window.confirm(
      "You have unsaved changes. Are you sure you want to discard them?"
    );
  }, [hasChanges]);

  return { confirmDiscard };
}
