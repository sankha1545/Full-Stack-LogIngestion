const KEY = "otp_cooldown_until";

export function startOtpCooldown(seconds = 30) {
  localStorage.setItem(KEY, String(Date.now() + seconds * 1000));
}

export function getOtpCooldown() {
  const until = Number(localStorage.getItem(KEY));
  if (!until) return 0;
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

export function clearOtpCooldown() {
  localStorage.removeItem(KEY);
}
