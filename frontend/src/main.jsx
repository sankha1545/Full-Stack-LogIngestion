// src/main.jsx
import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";

import App from "./App.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./auth/login/Login.jsx";
import Signup from "./auth/signup/SignupPage.jsx";
import CreateAccount from "./auth/signup/CreateAccount";
import Dashboard from "./pages/Dashboard.jsx";
import Analytics from "./pages/Analytics.jsx";
import ContactSales from "@/components/landingpage/Sales/ContactSales";

import RequireAuth from "./auth/RequireAuth.jsx";
import { AuthProvider } from "./context/AuthContext";

/* Lazy pages */
const Docs = lazy(() => import("@/components/landingpage/HowitWorks/docs/Docs"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/contact" element={<ContactSales />} />
            <Route path="/docs" element={<Docs />} />

            {/* Protected */}
            <Route element={<RequireAuth />}>
              <Route element={<App />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>

        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
