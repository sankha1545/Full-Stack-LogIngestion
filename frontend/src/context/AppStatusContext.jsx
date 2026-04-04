import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AppFallbackScreen from "@/components/app/AppFallbackScreen";
import { emitServerReachable, getServerStatusEventName } from "@/utils/appStatusEvents";

const AppStatusContext = createContext({
  serverReachable: true,
  fallbackMessage: "",
  setServerReachable: () => {},
  checkServerHealth: async () => {},
});

export function AppStatusProvider({ children }) {
  const [serverReachable, setServerReachable] = useState(true);
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [checking, setChecking] = useState(false);

  const checkServerHealth = useCallback(async () => {
    setChecking(true);

    try {
      const response = await fetch("/health", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("LogScope is online but returned an unhealthy response.");
      }

      setServerReachable(true);
      setFallbackMessage("");
      emitServerReachable();
    } catch (error) {
      setServerReachable(false);
      setFallbackMessage(error.message || "Unable to reach the LogScope server.");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    function handleStatusEvent(event) {
      const { reachable, message } = event.detail || {};
      setServerReachable(Boolean(reachable));
      setFallbackMessage(reachable ? "" : message || "Unable to reach the LogScope server.");
    }

    function handleOffline() {
      setServerReachable(false);
      setFallbackMessage("Your network connection appears to be offline.");
    }

    function handleOnline() {
      checkServerHealth();
    }

    window.addEventListener(getServerStatusEventName(), handleStatusEvent);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener(getServerStatusEventName(), handleStatusEvent);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [checkServerHealth]);

  const value = useMemo(
    () => ({
      serverReachable,
      fallbackMessage,
      setServerReachable,
      checkServerHealth,
    }),
    [checkServerHealth, fallbackMessage, serverReachable]
  );

  return (
    <AppStatusContext.Provider value={value}>
      {!serverReachable ? (
        <AppFallbackScreen
          title="We can't reach LogScope right now"
          message={fallbackMessage || "The server is taking too long to respond or is temporarily unavailable."}
          checking={checking}
          onRetry={checkServerHealth}
        />
      ) : (
        children
      )}
    </AppStatusContext.Provider>
  );
}

export function useAppStatus() {
  return useContext(AppStatusContext);
}
