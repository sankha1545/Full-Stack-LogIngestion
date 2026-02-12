export default function usePasswordStrength(password = "") {
  const checks = [
    password.length >= 10,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const score = checks.filter(Boolean).length;

  return {
    score,
    strength:
      score <= 2 ? "Weak" : score <= 4 ? "Medium" : "Strong",
  };
}
