export function getPasswordStrength(password = "") {
  let score = 0;

  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { label: "Weak", color: "bg-red-500", pct: 33 };
  }
  if (score === 3) {
    return { label: "Medium", color: "bg-amber-500", pct: 66 };
  }
  return { label: "Strong", color: "bg-emerald-500", pct: 100 };
}
