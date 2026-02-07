// src/main.jsx
import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";

/* Eager imports for small pages/components */
import ArchitectureDocs from "@/components/landingpage/Architecture/ArchitectureDocs";
import TemplateDocs from "@/components/landingpage/UseCases/TemplateDocs";
import Templates from "@/components/landingpage/UseCases/Templates.jsx";
import TemplateDetails from "@/components/landingpage/UseCases/TemplateDetails";

import App from "./App.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Analytics from "./pages/Analytics.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./auth/login/Login.jsx";
import Signup from "./auth/signup/SignupPage.jsx";
import ContactSales from "@/components/landingpage/Sales/ContactSales";

import RequireAuth from "./auth/RequireAuth.jsx";
import { AuthProvider } from "./context/AuthContext";

/* Lazy-load heavier docs pages (code-splitting) */
const Docs = lazy(() => import("@/components/landingpage/HowitWorks/docs/Docs"));
// you can also lazy-load ArchitectureDocs/TemplateDocs if desired:
// const ArchitectureDocs = lazy(() => import("@/components/landingpage/Architecture/ArchitectureDocs"));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        {/* Suspense wraps routes that contain lazy-loaded components */}
        <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/contact" element={<ContactSales />} />

            {/* Docs (public) */}
            <Route path="/docs" element={<Docs />} />

            {/* Architecture docs */}
            <Route path="/architecture/docs" element={<ArchitectureDocs />} />

            {/* Public templates + docs */}
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:id" element={<TemplateDetails />} />
            <Route path="/templates/:id/docs" element={<TemplateDocs />} />

            {/* Protected app routes (layout + auth guard) */}
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
