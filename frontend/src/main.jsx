// src/main.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import { HeroUIProvider } from "@heroui/react";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "./context/AuthContext";
import { AppStatusProvider } from "./context/AppStatusContext";
import { ThemeProvider } from "./context/ThemeContext";
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

import MFAChallenge from "@/components/auth/MFAChallenge";

import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Applications from "./pages/Applications";
import AppDetail from "./pages/AppDetail";

import SettingsLayout from "@/components/settings/SettingsLayout";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import NotificationsSettings from "./components/settings/NotificationsSettings";

import { LoaderProvider, useLoader } from "@/components/Loader/LoaderContext";
import api from "@/api/api";
import { setupInterceptors } from "@/api/setupInterceptors";

import AppErrorBoundary from "@/components/app/AppErrorBoundary";
import AppFallbackScreen from "@/components/app/AppFallbackScreen";
import AppLoadingScreen from "@/components/app/AppLoadingScreen";
import ThemeAwareToaster from "@/components/ThemeAwareToaster";

const Docs = lazy(() => import("@/components/landingpage/HowitWorks/docs/Docs"));

function InterceptorInitializer() {
  const { setLoading } = useLoader();

  useEffect(() => {
    const cleanup = setupInterceptors(api, setLoading);
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [setLoading]);

  return null;
}

createRoot(document.getElementById("root")).render(
  <HeroUIProvider>
    <AppErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LoaderProvider>
            <AppStatusProvider>
              <TooltipProvider delayDuration={150}>
                <BrowserRouter>
                  <InterceptorInitializer />

                  <Suspense
                    fallback={
                      <AppLoadingScreen
                        title="Loading page"
                        message="This route is taking a moment to load. We are getting it ready for you."
                      />
                    }
                  >
                    <Routes>
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

                      <Route
                        path="*"
                        element={
                          <AppFallbackScreen
                            title="Page not found"
                            message="The page you tried to open does not exist or may have been moved."
                            actionLabel="Go home"
                            onRetry={() => {
                              window.location.href = "/";
                            }}
                          />
                        }
                      />
                    </Routes>
                  </Suspense>

                  <ThemeAwareToaster />
                </BrowserRouter>
              </TooltipProvider>
            </AppStatusProvider>
          </LoaderProvider>
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  </HeroUIProvider>
);
