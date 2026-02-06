import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";

import App from "./App.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Analytics from "./pages/Analytics.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./auth/login/Login.jsx";
import Signup from "./auth/signup/SignupPage.jsx";
import ContactSales from "@/components/landingpage/ContactSales";

import RequireAuth from "./auth/RequireAuth.jsx";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<ContactSales />} /> {/* ✅ ADD THIS */}

          {/* Protected routes */}
          <Route element={<RequireAuth />}>
            <Route element={<App />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
            </Route>
          </Route>
        </Routes>

        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
