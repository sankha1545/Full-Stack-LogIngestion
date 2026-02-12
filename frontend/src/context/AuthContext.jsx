import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  /* =====================================================
     DEBUG HELPER
  ===================================================== */

  const log = (...args) => {
    console.log("%c[AUTH DEBUG]", "color:#8b5cf6;font-weight:bold", ...args);
  };

  /* =====================================================
     STATE
  ===================================================== */

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    console.log("[AUTH INIT] token from storage:", stored);
    return stored;
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    console.log("[AUTH INIT] user from storage:", stored);
    return stored ? JSON.parse(stored) : null;
  });

  const [tempMfaSession, setTempMfaSessionState] = useState(() => {
    const stored = sessionStorage.getItem("mfaSession");
    console.log("[AUTH INIT] MFA session:", stored);
    return stored ? JSON.parse(stored) : null;
  });

  const [hydrating, setHydrating] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  /* =====================================================
     LOGIN
  ===================================================== */

  const login = (jwt, userData = null) => {
    log("LOGIN CALLED");
    log("Saving token:", jwt);
    log("User data:", userData);

    localStorage.setItem("token", jwt);
    setToken(jwt);

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }

    sessionStorage.removeItem("mfaSession");
    setTempMfaSessionState(null);
  };

  /* =====================================================
     MFA TEMP SESSION
  ===================================================== */

  const setTempMfaSession = (session) => {
    log("Setting temp MFA session:", session);
    sessionStorage.setItem("mfaSession", JSON.stringify(session));
    setTempMfaSessionState(session);
  };

  const clearTempMfaSession = () => {
    log("Clearing MFA session");
    sessionStorage.removeItem("mfaSession");
    setTempMfaSessionState(null);
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout = async (reason = "manual") => {
    log("LOGOUT CALLED — Reason:", reason);

    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {}

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("mfaSession");

    setToken(null);
    setUser(null);
    setTempMfaSessionState(null);
  };

  /* =====================================================
     TOKEN STATE WATCHER
  ===================================================== */

  useEffect(() => {
    log("TOKEN STATE CHANGED:", token);
  }, [token]);

  /* =====================================================
     USER STATE WATCHER
  ===================================================== */

  useEffect(() => {
    log("USER STATE CHANGED:", user);
  }, [user]);

  /* =====================================================
     AUTO LOGOUT IF TOKEN EXPIRED
  ===================================================== */

  useEffect(() => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      log("Decoded token payload:", payload);

      if (payload.exp * 1000 < Date.now()) {
        log("Token expired — logging out");
        logout("token expired");
      }
    } catch (err) {
      log("Token decode failed — logging out", err);
      logout("decode failed");
    }
  }, [token]);

  /* =====================================================
     HYDRATE USER
  ===================================================== */

useEffect(() => {
  if (!token) return;

  async function hydrateUser() {
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.warn("[AUTH] Profile fetch failed, but NOT logging out.");
        return;
      }

      const data = await res.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));

    } catch (err) {
      console.warn("[AUTH] Profile fetch error:", err);
      // 🚫 DO NOT logout here
    }
  }

  hydrateUser();
}, [token]);


  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  const value = {
    token,
    user,
    hydrating,
    isAuthenticated: Boolean(token),
    mfaPending: Boolean(tempMfaSession),
    tempMfaSession,

    login,
    logout,
    setTempMfaSession,
    clearTempMfaSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* =====================================================
   HOOK
===================================================== */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
