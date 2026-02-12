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

  const log = (...args) =>
    console.log("%c[AUTH DEBUG]", "color:#8b5cf6;font-weight:bold", ...args);

  /* =====================================================
     STATE
  ===================================================== */

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [tempMfaSession, setTempMfaSessionState] = useState(() => {
    const stored = sessionStorage.getItem("mfaSession");
    return stored ? JSON.parse(stored) : null;
  });

  // ⭐ CRITICAL — prevents UI rendering before profile loads
  const [initializing, setInitializing] = useState(true);

  const [hydrating, setHydrating] = useState(false);

  /* =====================================================
     FETCH USER (SINGLE SOURCE OF TRUTH)
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
        credentials: "include",
      });

      if (!res.ok) {
        log("Profile refresh failed:", res.status);

        // clear stale state
        localStorage.removeItem("user");
        setUser(null);
        return;
      }

      const data = await res.json();

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));

      log("User updated:", data);
    } catch (err) {
      log("Profile refresh error:", err);

      // clear stale state
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setHydrating(false);
    }
  }, [token, API_URL]);

  /* =====================================================
     LOGIN (FIXED — wait for token update)
  ===================================================== */

  const login = async (jwt, userData = null) => {
    log("LOGIN CALLED");

    localStorage.setItem("token", jwt);
    setToken(jwt);

    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }

    sessionStorage.removeItem("mfaSession");
    setTempMfaSessionState(null);
  };

  /* =====================================================
     MFA TEMP SESSION
  ===================================================== */

  const setTempMfaSession = (session) => {
    sessionStorage.setItem("mfaSession", JSON.stringify(session));
    setTempMfaSessionState(session);
  };

  const clearTempMfaSession = () => {
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
        log("Token expired → logout");
        logout();
      }
    } catch {
      logout();
    }
  }, [token, logout]);

  /* =====================================================
     AUTO HYDRATE USER (FIXED — proper initialization)
  ===================================================== */

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setUser(null);
        setInitializing(false);
        return;
      }

      await refreshUser();
      setInitializing(false);
    };

    init();
  }, [token, refreshUser]);

  /* =====================================================
     CONTEXT VALUE
  ===================================================== */

  const value = {
    token,
    user,

    initializing, // ⭐ use this in UI
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
