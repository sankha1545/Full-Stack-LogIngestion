import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import { changePasswordSchema } from "@/utils/passwordSchema";
import { changePassword } from "@/api/passwordApi";
import usePasswordStrength from "@/hooks/usePasswordStrength";
import Spinner from "@/components/ui/Spinner";
import { motion } from "framer-motion";

function StrengthBar({ score }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded">
      <motion.div
        className="h-2 bg-green-500 rounded"
        animate={{ width: `${score * 20}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

export default function ChangePasswordModal({ onClose }) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPassword = form.watch("newPassword");
  const { score, strength } = usePasswordStrength(newPassword);

  const submit = async (data) => {
    setLoading(true);

    try {
      const res = await changePassword(data.newPassword);

      if (!res.ok) {
        toast.error("Password change failed");
        return;
      }

      toast.success("Password updated — please login again");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Change Password</h3>

      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          {...form.register("newPassword")}
          className="w-full input"
        />

        <StrengthBar score={score} />
        <p className="text-sm">Strength: {strength}</p>

        <input
          type="password"
          placeholder="Confirm password"
          {...form.register("confirmPassword")}
          className="w-full input"
        />

        <p className="text-sm text-red-500">
          {form.formState.errors.confirmPassword?.message}
        </p>

        <div className="flex gap-2">
          <button
            disabled={loading}
            className="flex items-center gap-2 btn-primary"
          >
            {loading && <Spinner size={16} />}
            Change Password
          </button>

          <button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
