const BASE = "/api/auth/password";

export async function verifyPassword(currentPassword) {
  return fetch(`${BASE}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword }),
  });
}

export async function changePassword(newPassword) {
  return fetch(`${BASE}/change`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ newPassword }),
  });
}
