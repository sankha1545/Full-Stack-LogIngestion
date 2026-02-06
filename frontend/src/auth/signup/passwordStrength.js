export default function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-500" };
  if (score === 3) return { label: "Medium", color: "bg-yellow-500" };
  if (score >= 4) return { label: "Strong", color: "bg-green-500" };
}
