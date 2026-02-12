const API_URL = import.meta.env.VITE_API_URL;

/* =====================================================
   HELPER
===================================================== */

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.error || "Request failed";
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

/* =====================================================
   LOGIN
===================================================== */

export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 🔐 required for refresh cookie
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(res);

  /*
    Possible responses:

    1️⃣ Normal login:
        { token, user }

    2️⃣ MFA required:
        { mfaRequired: true, tempToken }

    3️⃣ Account locked:
        { error, lockedUntil }
  */

  if (data.mfaRequired) {
    return {
      type: "MFA_REQUIRED",
      tempToken: data.tempToken,
    };
  }

  return {
    type: "SUCCESS",
    token: data.token,
    user: data.user,
  };
}

/* =====================================================
   MFA VERIFY
===================================================== */

export async function verifyMfa(tempToken, code, rememberDevice = false) {
  const res = await fetch(`${API_URL}/api/auth/mfa/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      tempToken,
      code,
      rememberDevice,
    }),
  });

  const data = await handleResponse(res);

  return {
    token: data.token,
    user: data.user,
  };
}

/* =====================================================
   SIGNUP
===================================================== */

export async function signup(payload) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);

  return {
    token: data.token,
    user: data.user,
  };
}

/* =====================================================
   LOGOUT
===================================================== */

export async function logout() {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

/* =====================================================
   REFRESH TOKEN
===================================================== */

export async function refreshToken() {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  const data = await handleResponse(res);

  return data.token;
}

/* =====================================================
   OAUTH FINALIZATION
===================================================== */

export function parseOAuthResponse(query) {
  const params = new URLSearchParams(query);

  if (params.get("mfaRequired") === "true") {
    return {
      type: "MFA_REQUIRED",
      tempToken: params.get("tempToken"),
    };
  }

  const token = params.get("token");

  if (token) {
    return {
      type: "SUCCESS",
      token,
    };
  }

  return { type: "ERROR" };
}
