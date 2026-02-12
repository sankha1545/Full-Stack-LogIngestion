import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { verifyPasswordSchema } from "@/utils/passwordSchema";
import { verifyPassword } from "@/api/passwordApi";
import Spinner from "@/components/ui/Spinner";

export default function VerifyPasswordModal({ onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(verifyPasswordSchema),
  });

  const submit = async (data) => {
    setLoading(true);

    try {
      const res = await verifyPassword(data.currentPassword);

      if (!res.ok) {
        form.setError("currentPassword", {
          message: "Incorrect password",
        });
        toast.error("Incorrect password");
        return;
      }

      toast.success("Password verified");
      onSuccess();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Verify Password</h3>

      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        <input
          type="password"
          placeholder="Current password"
          {...form.register("currentPassword")}
          className="w-full input"
        />

        <p className="text-sm text-red-500">
          {form.formState.errors.currentPassword?.message}
        </p>

        <div className="flex gap-2">
          <button
            disabled={loading}
            className="flex items-center gap-2 btn-primary"
          >
            {loading && <Spinner size={16} />}
            Verify
          </button>

          <button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
