// src/services/socket.js

import { io } from "socket.io-client";

let socket;

/* =====================================================
   GET AUTH TOKEN
   (Adjust if stored differently)
===================================================== */

function getAuthToken() {

  return localStorage.getItem("token");

}


/* =====================================================
   CREATE SOCKET CONNECTION
===================================================== */

export function getSocket() {

  if (!socket) {

    const token = getAuthToken();

    socket = io(

      "http://localhost:3001",

      {

        path: "/socket.io",

        transports: ["websocket"],

        withCredentials: true,

        autoConnect: true,

        reconnection: true,

        reconnectionAttempts: 10,

        reconnectionDelay: 1000,

        timeout: 20000,

        /* ⭐ CRITICAL FIX — send token */

        auth: token
          ? { token }
          : undefined,

      }

    );


    /* =====================================================
       DEBUG EVENTS (VERY IMPORTANT)
    ===================================================== */


    socket.on("connect", () => {

      console.log(
        "✅ Socket connected:",
        socket.id
      );

    });


    socket.on("disconnect", (reason) => {

      console.log(
        "❌ Socket disconnected:",
        reason
      );

    });


    socket.on("connect_error", (err) => {

      console.error(
        "🚨 Socket connection error:",
        err.message
      );

    });


    socket.on("reconnect", (attempt) => {

      console.log(
        "🔄 Socket reconnected attempt:",
        attempt
      );

    });


    socket.on("reconnect_failed", () => {

      console.error(
        "🚨 Socket reconnection failed"
      );

    });

  }

  return socket;

}
