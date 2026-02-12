import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth() {
  const { token } = useAuth();
  const location = useLocation();

  console.log("[RequireAuth] token:", token);

  if (!token) {
    console.log("[RequireAuth] No token → redirecting to login");
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
