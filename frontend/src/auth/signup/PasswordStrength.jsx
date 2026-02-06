export default function PasswordStrength({ password }) {
  const score = getScore(password);

  return (
    <div className="mt-2">
      <div className="h-1 rounded bg-white/10">
        <div
          className={`h-1 rounded ${
            score < 2 ? "bg-red-500" :
            score < 4 ? "bg-yellow-500" :
            "bg-green-500"
          }`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-white/60">
        {score < 2 && "Weak"}
        {score >= 2 && score < 4 && "Moderate"}
        {score >= 4 && "Strong"}
      </p>
    </div>
  );
}

function getScore(pwd) {
  let s = 0;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[a-z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}
