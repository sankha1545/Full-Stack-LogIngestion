import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const API_URL = import.meta.env.VITE_API_URL;

  /* =====================================================
     DEBUG LOGGER
  ===================================================== */

  const log = (...args) =>
    console.log("%c[AUTH DEBUG]", "color:#8b5cf6;font-weight:bold", ...args);

  /* =====================================================
     STATE
  ===================================================== */

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    console.log("[AUTH INIT] token from storage:", stored);
    return stored || null;
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

  /* =====================================================
     REFRESH USER — SINGLE SOURCE OF TRUTH
     Always fetch from backend
  ===================================================== */

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      log("Refreshing user profile...");
      setHydrating(true);

      const res = await fetch(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        log("Profile refresh failed:", res.status);
        return;
      }

      const data = await res.json();

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));

      log("User updated:", data);
    } catch (err) {
      log("Profile refresh error:", err);
    } finally {
      setHydrating(false);
    }
  }, [token, API_URL]);

  /* =====================================================
     LOGIN
     Saves token → syncs user from backend
  ===================================================== */

  const login = async (jwt, userData = null) => {
    log("LOGIN CALLED");

    localStorage.setItem("token", jwt);
    setToken(jwt);

    // temporary user until backend sync
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    }

    // clear MFA temp session
    sessionStorage.removeItem("mfaSession");
    setTempMfaSessionState(null);

    // always sync full profile from backend
    await refreshUser();
  };

  /* =====================================================
     MFA TEMP SESSION
  ===================================================== */

  const setTempMfaSession = (session) => {
    log("Setting MFA temp session:", session);
    sessionStorage.setItem("mfaSession", JSON.stringify(session));
    setTempMfaSessionState(session);
  };

  const clearTempMfaSession = () => {
    log("Clearing MFA temp session");
    sessionStorage.removeItem("mfaSession");
    setTempMfaSessionState(null);
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout = useCallback(async () => {
    log("LOGOUT CALLED");

    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("mfaSession");

    setToken(null);
    setUser(null);
    setTempMfaSessionState(null);
  }, [API_URL]);

  /* =====================================================
     TOKEN EXPIRY CHECK
  ===================================================== */

  useEffect(() => {
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.exp * 1000 < Date.now()) {
        log("Token expired → logging out");
        logout();
      }
    } catch {
      logout();
    }
  }, [token, logout]);

  /* =====================================================
     AUTO HYDRATE USER ON APP LOAD (FIXED)
     Always fetch user if token exists
  ===================================================== */

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    refreshUser();
  }, [token, refreshUser]);

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  const value = {
    token,
    user,
    hydrating,

    isAuthenticated: Boolean(token),

    tempMfaSession,
    mfaPending: Boolean(tempMfaSession),

    login,
    logout,
    refreshUser,

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
