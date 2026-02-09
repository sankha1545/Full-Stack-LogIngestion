import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState(null);

  /* --------------------------- auth actions --------------------------- */

  const login = (jwt, userData = null) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);

    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  /* ----------------------- optional: hydrate user ---------------------- */
  /**
   * If later you add `/me` endpoint, you can safely enable this.
   * For now it stays passive and non-blocking.
   */
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    // 🔮 Future-ready hook:
    // fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
    //   headers: { Authorization: `Bearer ${token}` },
    // })
    //   .then(res => res.ok ? res.json() : null)
    //   .then(data => setUser(data))
    //   .catch(() => logout());

  }, [token]);

  /* ----------------------------- context ------------------------------ */

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* ----------------------------- hook ---------------------------------- */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
