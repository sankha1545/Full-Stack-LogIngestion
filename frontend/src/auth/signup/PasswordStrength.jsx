// src/auth/signup/PasswordStrength.jsx
import { getPasswordStrength } from "./getPasswordStrength";

export default function PasswordStrength({ password }) {
  if (!password) return null;

  const { label, color } = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-24 rounded ${color}`} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
    </div>
  );
}
