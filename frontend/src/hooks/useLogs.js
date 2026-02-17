// src/hooks/useLogs.js

import { useEffect, useState, useRef, useMemo } from "react";
import { fetchLogs } from "../api/logsApi";
import { getSocket } from "../services/socket";


/* =====================================================
VALIDATE FILTERS
===================================================== */

function validateFilters(filters = {}) {

  if (filters.from && filters.to) {

    const from = new Date(filters.from).getTime();
    const to = new Date(filters.to).getTime();

    if (!isNaN(from) && !isNaN(to) && from > to) {

      return {
        valid: false,
        error: "From date should not be greater than To date",
      };

    }

  }

  return { valid: true, error: null };

}



/* =====================================================
HOOK
===================================================== */

export function useLogs(filters = {}, options = {}) {

  const { page = 1, limit = 50 } = options;


  const [logs, setLogs] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);


  const prevIds = useRef(new Set());

  const abortRef = useRef(null);


  const applicationId = filters?.applicationId || null;


  const filtersKey = useMemo(
    () => JSON.stringify(filters || {}),
    [filters]
  );



  /* =====================================================
  FETCH LOGS — FINAL FIX
  ===================================================== */

  useEffect(() => {

    if (!applicationId) return;


    if (abortRef.current)
      abortRef.current.abort();


    const controller = new AbortController();

    abortRef.current = controller;


    const validation = validateFilters(filters);

    if (!validation.valid) {

      setError(validation.error);

      return;

    }


    setLoading(true);

    setError(null);


    fetchLogs(
      { ...filters, page, limit },
      controller.signal
    )

      .then((response) => {

        /*
        CORRECT BACKEND FORMAT:

        {
          page,
          limit,
          total,
          totalPages,
          data: logsArray
        }
        */


        if (!response || !Array.isArray(response.data)) {

          console.error(
            "Invalid logs response:",
            response
          );

          setLogs([]);

          return;

        }


        const logsArray = response.data;


        console.log(
          "✅ Logs fetched:",
          logsArray.length
        );


        const normalized = logsArray.map((log) => ({

          ...log,

          meta: log.metadata || {},

        }));


        prevIds.current =
          new Set(normalized.map(l => l.id));


        setLogs(normalized);

      })


      .catch((err) => {

        if (err.name !== "AbortError") {

          console.error(err);

          setError(
            err.message ||
            "Failed to fetch logs"
          );

        }

      })


      .finally(() => {

        setLoading(false);

      });


    return () => controller.abort();

  }, [filtersKey, page, limit, applicationId]);




  /* =====================================================
  REALTIME SOCKET — FINAL
  ===================================================== */

  useEffect(() => {

    if (!applicationId) return;


    const socket = getSocket();


    socket.connect();


    const onConnect = () => {

      console.log(
        "📡 Joining room:",
        applicationId
      );

      socket.emit(
        "join_application",
        applicationId
      );

    };


    socket.on("connect", onConnect);



    const onNewLog = (log) => {

      console.log(
        "🔥 LIVE LOG:",
        log
      );


      if (!log) return;

      if (log.applicationId !== applicationId)
        return;

      if (prevIds.current.has(log.id))
        return;


      const normalized = {

        ...log,

        meta: log.metadata || {},

      };


      prevIds.current.add(log.id);


      setLogs(prev => [

        normalized,

        ...prev,

      ]);

    };


    socket.on(
      "new_log",
      onNewLog
    );



    return () => {

      socket.off(
        "connect",
        onConnect
      );

      socket.off(
        "new_log",
        onNewLog
      );

    };

  }, [applicationId]);




  /* =====================================================
  RETURN
  ===================================================== */

  return {

    logs,

    loading,

    error,

  };

}
