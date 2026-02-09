const API = import.meta.env.VITE_API_URL;

export async function sendResetOtp(email) {
  const res = await fetch(`${API}/api/auth/forgot-password/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to send OTP");
}

export async function verifyResetOtp(email, code) {
  const res = await fetch(`${API}/api/auth/forgot-password/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) throw new Error("Invalid OTP");
}

export async function resetPassword(email, password) {
  const res = await fetch(`${API}/api/auth/forgot-password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Password reset failed");
}
