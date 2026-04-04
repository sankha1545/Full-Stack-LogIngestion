import { emitServerReachable, emitServerUnreachable } from "@/utils/appStatusEvents";

export function setupInterceptors(api, setLoading) {
  if (!api || typeof api.interceptors === "undefined") {
    console.warn("setupInterceptors: invalid axios instance");
    return;
  }

  const reqId = api.interceptors.request.use(
    (config) => {
      try {
        if (typeof setLoading === "function") setLoading(true);
      } catch (error) {
        console.warn("Failed to toggle loader in request interceptor", error);
      }
      return config;
    },
    (error) => {
      try {
        if (typeof setLoading === "function") setLoading(false);
      } catch (loaderError) {
        console.warn("Failed to reset loader after request error", loaderError);
      }
      return Promise.reject(error);
    }
  );

  const resId = api.interceptors.response.use(
    (response) => {
      try {
        if (typeof setLoading === "function") setLoading(false);
      } catch (error) {
        console.warn("Failed to toggle loader after response", error);
      }
      emitServerReachable();
      return response;
    },
    (error) => {
      try {
        if (typeof setLoading === "function") setLoading(false);
      } catch (loaderError) {
        console.warn("Failed to toggle loader after response error", loaderError);
      }

      if (!error?.response || error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
        emitServerUnreachable("Unable to reach the LogScope server. Check your connection or backend service.");
      }

      return Promise.reject(error);
    }
  );

  return () => {
    try {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    } catch (error) {
      console.warn("Failed to eject axios interceptors", error);
    }
  };
}
