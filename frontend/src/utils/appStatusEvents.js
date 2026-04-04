const SERVER_STATUS_EVENT = "logscope:server-status";

export function emitServerReachable() {
  window.dispatchEvent(
    new CustomEvent(SERVER_STATUS_EVENT, {
      detail: { reachable: true, message: "" },
    })
  );
}

export function emitServerUnreachable(message = "Unable to reach the LogScope server.") {
  window.dispatchEvent(
    new CustomEvent(SERVER_STATUS_EVENT, {
      detail: { reachable: false, message },
    })
  );
}

export function getServerStatusEventName() {
  return SERVER_STATUS_EVENT;
}
