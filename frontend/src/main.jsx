// src/main.jsx

import { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";

import { HeroUIProvider } from "@heroui/react";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "./context/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import App from "./App";

import Landing from "./pages/Landing";
import Login from "./auth/login/Login";
import Signup from "./auth/signup/SignupPage";
import CreateAccount from "./auth/signup/CreateAccount";
import ContactSales from "@/components/landingpage/Sales/ContactSales";
import OAuthCallback from "./auth/oauth/OAuthCallback";

import ForgotPassword from "./auth/forgot-password/ForgotPassword";
import VerifyOtp from "./auth/forgot-password/VerifyOtp";
import ResetPassword from "./auth/forgot-password/ResetPassword";

import MFAChallenge from "./components/auth/MFAChallenge";

import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Applications from "./pages/Applications";
import AppDetail from "./pages/AppDetail";

import SettingsLayout from "@/components/settings/SettingsLayout";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import NotificationsSettings from "./components/settings/NotificationsSettings";

const Docs = lazy(() =>
  import("@/components/landingpage/HowitWorks/docs/Docs")
);

createRoot(document.getElementById("root")).render(
  <HeroUIProvider>
    <AuthProvider>
      <TooltipProvider delayDuration={150}>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-screen text-slate-500">
                <div className="text-sm animate-pulse">Loading…</div>
              </div>
            }
          >
            <Routes>

              {/* PUBLIC */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/contact" element={<ContactSales />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="/mfa-verify" element={<MFAChallenge />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/forgot-password/verify" element={<VerifyOtp />} />
              <Route path="/forgot-password/reset" element={<ResetPassword />} />

              {/* PROTECTED */}
              <Route element={<RequireAuth />}>
                <Route element={<App />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/applications/:id" element={<AppDetail />} />

                  <Route path="/settings" element={<SettingsLayout />}>
                    <Route index element={<ProfileSettings />} />
                    <Route path="profile" element={<ProfileSettings />} />
                    <Route path="security" element={<SecuritySettings />} />
                    <Route path="appearance" element={<AppearanceSettings />} />
                    <Route path="notifications" element={<NotificationsSettings />} />
                  </Route>
                </Route>
              </Route>

              {/* FALLBACK */}
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center h-screen text-slate-500">
                    Page not found
                  </div>
                }
              />

            </Routes>
          </Suspense>

          <Toaster position="top-right" />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </HeroUIProvider>
);
