// src/main.jsx
import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";

/* --------------------------------------------------
   Providers & Guards
-------------------------------------------------- */
import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import App from "./App";

/* shadcn / radix providers */
import { TooltipProvider } from "@/components/ui/tooltip";

/* --------------------------------------------------
   Public Pages
-------------------------------------------------- */
import Landing from "./pages/Landing";
import Login from "./auth/login/Login";
import Signup from "./auth/signup/SignupPage";
import CreateAccount from "./auth/signup/CreateAccount";
import ContactSales from "@/components/landingpage/Sales/ContactSales";

/* OAuth */
import OAuthCallback from "./auth/oauth/OAuthCallback";

/* Forgot Password */
import ForgotPassword from "./auth/forgot-password/ForgotPassword";
import VerifyOtp from "./auth/forgot-password/VerifyOtp";
import ResetPassword from "./auth/forgot-password/ResetPassword";

/* --------------------------------------------------
   Protected Pages
-------------------------------------------------- */
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";

/* Settings */
import SettingsLayout from "@/components/settings/SettingsLayout";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";

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
      {/* Required for shadcn Tooltips, Dropdowns, etc */}
      <TooltipProvider delayDuration={150}>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-screen text-muted-foreground">
                Loading…
              </div>
            }
          >
            <Routes>
              {/* ================= PUBLIC ================= */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/contact" element={<ContactSales />} />
              <Route path="/docs" element={<Docs />} />

              {/* OAuth */}
              <Route path="/oauth/callback" element={<OAuthCallback />} />

              {/* Forgot Password */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/forgot-password/verify" element={<VerifyOtp />} />
              <Route path="/forgot-password/reset" element={<ResetPassword />} />

              {/* ================= PROTECTED ================= */}
              <Route element={<RequireAuth />}>
                <Route element={<App />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />

                  {/* Settings */}
                  <Route path="/settings" element={<SettingsLayout />}>
                    <Route index element={<ProfileSettings />} />
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="security" element={<SecuritySettings />} />
                    <Route path="appearance" element={<AppearanceSettings />} />
                  </Route>
                </Route>
              </Route>

              {/* ================= FALLBACK ================= */}
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center h-screen text-muted-foreground">
                    Page not found
                  </div>
                }
              />
            </Routes>
          </Suspense>

          {/* Global toasts */}
          <Toaster position="top-right" />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </StrictMode>
);
