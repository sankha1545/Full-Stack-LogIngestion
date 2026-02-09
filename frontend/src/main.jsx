// src/main.jsx
import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";

/* --------------------------------------------------
   Core App + Providers
-------------------------------------------------- */
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./auth/RequireAuth.jsx";

/* --------------------------------------------------
   Public Pages
-------------------------------------------------- */
import Landing from "./pages/Landing.jsx";
import Login from "./auth/login/Login.jsx";
import Signup from "./auth/signup/SignupPage.jsx";
import CreateAccount from "./auth/signup/CreateAccount.jsx";
import ContactSales from "@/components/landingpage/Sales/ContactSales";

/* --------------------------------------------------
   Forgot Password Flow (PUBLIC)
-------------------------------------------------- */
import ForgotPassword from "./auth/forgot-password/ForgotPassword.jsx";
import VerifyOtp from "./auth/forgot-password/VerifyOtp.jsx";
import ResetPassword from "./auth/forgot-password/ResetPassword.jsx";
import OAuthCallback from "./auth/oauth/OAuthCallback.jsx";

/* --------------------------------------------------
   Protected Pages
-------------------------------------------------- */
import Dashboard from "./pages/Dashboard.jsx";
import Analytics from "./pages/Analytics.jsx";

/* --------------------------------------------------
   Lazy-loaded Pages
-------------------------------------------------- */
const Docs = lazy(() =>
  import("@/components/landingpage/HowitWorks/docs/Docs")
);

/* --------------------------------------------------
   Render
-------------------------------------------------- */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
          <Routes>
            {/* ================= PUBLIC ================= */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/contact" element={<ContactSales />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            {/* Forgot Password (PUBLIC) */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/forgot-password/verify"
              element={<VerifyOtp />}
            />
            <Route
              path="/forgot-password/reset"
              element={<ResetPassword />}
            />

            {/* ================= PROTECTED ================= */}
            <Route element={<RequireAuth />}>
              <Route element={<App />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>

        {/* Toast notifications */}
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
