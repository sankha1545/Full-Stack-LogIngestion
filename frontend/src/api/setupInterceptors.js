
export function setupInterceptors(api, setLoading) {
  if (!api || typeof api.interceptors === "undefined") {
    console.warn("setupInterceptors: invalid axios instance");
    return;
  }

  // Request interceptor: show loader
  const reqId = api.interceptors.request.use(
    (config) => {
      try {
        if (typeof setLoading === "function") setLoading(true);
      } catch (e) {
        /* ignore */
      }
      return config;
    },
    (error) => {
      try {
        if (typeof setLoading === "function") setLoading(false);
      } catch (e) {}
      return Promise.reject(error);
    }
  );

  // Response interceptor: hide loader on success or error
  const resId = api.interceptors.response.use(
    (response) => {
      try {
        if (typeof setLoading === "function") setLoading(false);
      } catch (e) {}
      return response;
    },
    (error) => {
      try {
        if (typeof setLoading === "function") setLoading(false);
      } catch (e) {}
      return Promise.reject(error);
    }
  );

  // Return cleanup function
  return () => {
    try {
      api.interceptors.request.eject(reqId);
      api.interceptors.response.eject(resId);
    } catch (e) {
      /* ignore */
    }
  };
}
