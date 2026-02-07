export default function PasswordStrength({ password }) {
  if (!password) return null;

  const strength = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <span
        className="text-sm font-medium"
        style={{ color: strength.color }}
      >
        {strength.label}
      </span>
    </div>
  );
}

/* ---------------------------------- */
/* Helper                              */
/* ---------------------------------- */

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return { label: "Weak", color: "#ef4444" };
  }
  if (score === 2) {
    return { label: "Medium", color: "#f59e0b" };
  }
  return { label: "Strong", color: "#22c55e" };
}
