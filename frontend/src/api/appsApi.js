// src/api/appsApi.js

import api from "@/lib/api";

/**
 * =====================================================
 * APPLICATION API — LogScope SaaS Client
 * =====================================================
 *
 * Provides:
 * - application lifecycle
 * - connection string handling
 * - api key management
 * - future sdk helpers
 *
 * All responses normalized for UI safety.
 */

/* =====================================================
   HELPERS
===================================================== */

function handleError(error) {
  const message =
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong";

  throw new Error(message);
}

/* =====================================================
   GET ALL APPLICATIONS
===================================================== */

export async function getApps() {
  try {
    const res = await api.get("/apps");

    return {
      success: true,
      data: res.data || [],
    };
  } catch (error) {
    handleError(error);
  }
}

/* =====================================================
   CREATE APPLICATION
===================================================== */

export async function createApp(payload) {
  try {
    const res = await api.post("/apps", payload);

    /**
     * Backend returns:
     * {
     *   id,
     *   name,
     *   environment,
     *   apiKey,
     *   connectionString
     * }
     */

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    handleError(error);
  }
}

/* =====================================================
   GET SINGLE APPLICATION
===================================================== */

export async function getApp(id) {
  try {
    const res = await api.get(`/apps/${id}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    handleError(error);
  }
}

/* =====================================================
   ROTATE API KEY
===================================================== */

export async function rotateApiKey(id) {
  try {
    const res = await api.post(`/apps/${id}/rotate`);

    return {
      success: true,
      data: res.data, // { apiKey, connectionString }
    };
  } catch (error) {
    handleError(error);
  }
}

/* =====================================================
   DELETE APPLICATION
===================================================== */

export async function deleteApp(id) {
  try {
    const res = await api.delete(`/apps/${id}`);

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    handleError(error);
  }
}

/* =====================================================
   COPY CONNECTION STRING HELPER
===================================================== */

export async function copyConnectionString(connectionString) {
  try {
    await navigator.clipboard.writeText(connectionString);
    return { success: true };
  } catch {
    throw new Error("Failed to copy connection string");
  }
}

/* =====================================================
   OPTIONAL — GENERATE SDK EXAMPLE (UI HELPER)
===================================================== */

export function generateNodeSdkExample(connectionString) {
  return `
// LogScope SDK Example (Node.js)

fetch("${connectionString}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    level: "error",
    message: "Something failed",
    timestamp: new Date().toISOString()
  })
});
`;
}
