import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io({
      path: "/socket.io",
      transports: ["websocket"],
      upgrade: false,
      reconnection: true,
    });
  }
  return socket;
}
