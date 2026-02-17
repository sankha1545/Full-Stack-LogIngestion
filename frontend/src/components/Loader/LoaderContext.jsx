// src/components/Loader/LoaderContext.jsx
import React, { createContext, useContext, useState } from "react";
import Loader from "./Loader";

const LoaderContext = createContext(null);

export function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {loading && <Loader />}
      {children}
    </LoaderContext.Provider>
  );
}

// named export — this is the hook the rest of your app can use
export function useLoader() {
  const ctx = useContext(LoaderContext);
  if (!ctx) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return ctx;
}
