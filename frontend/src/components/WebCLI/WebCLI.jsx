import { useEffect, useRef, useState } from "react";
import { socket } from "../../services/socket";

export default function WebCLI({ open, onClose }) {
  const [lines, setLines] = useState([
    "LogScope Web Terminal",
    "Type 'help' to see available commands",
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [hIndex, setHIndex] = useState(-1);
  const [tailing, setTailing] = useState(false);

  const inputRef = useRef();
  const scrollRef = useRef();

  // focus input
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // auto scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  // live socket
  useEffect(() => {
    const handler = (log) => {
      if (!tailing) return;
      setLines((l) => [
        ...l,
        `[LIVE] ${log.level.toUpperCase()} | ${log.message}`,
      ]);
    };
    socket.on("new_log", handler);
    return () => socket.off("new_log", handler);
  }, [tailing]);

  async function runCommand(cmd) {
    const raw = cmd.trim();
    const c = raw.toLowerCase();
    if (!raw) return;

    setLines((l) => [...l, `> ${raw}`]);
    setHistory((h) => [...h, raw]);
    setHIndex(-1);

    /* -------- Commands -------- */

    if (c === "help") {
      setLines((l) => [
        ...l,
        "send        → send test log",
        "tail        → live stream",
        "get         → fetch all logs",
        "clear / cls → clear screen",
        "exit        → close terminal",
      ]);
    }

    else if (c === "clear" || c === "cls") {
      setLines([]);
    }

    else if (c === "exit") onClose();

    else if (c === "tail") {
      setTailing(true);
      setLines((l) => [...l, "📡 Live mode enabled..."]);
    }

    else if (c === "send") {
      await fetch("http://localhost:3001/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: "info",
          message: "Log from Web CLI",
          resourceId: "web-cli",
          timestamp: new Date().toISOString(),
          traceId: crypto.randomUUID(),
          spanId: "cli",
          commit: "web",
          metadata: {},
        }),
      });
      setLines((l) => [...l, "✔ Log sent"]);
    }

    else if (c === "get") {
      const res = await fetch("http://localhost:3001/logs");
      const data = await res.json();
      data.slice(0, 5).forEach((l) =>
        setLines((x) => [
          ...x,
          `${l.level.toUpperCase()} | ${l.message}`,
        ])
      );
    }

    else setLines((l) => [...l, `Unknown command: ${raw}`]);
  }

  function handleKey(e) {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    }

    if (e.key === "ArrowUp") {
      if (!history.length) return;
      const i = hIndex < history.length - 1 ? hIndex + 1 : hIndex;
      setHIndex(i);
      setInput(history[history.length - 1 - i]);
    }

    if (e.key === "ArrowDown") {
      if (hIndex <= 0) {
        setHIndex(-1);
        setInput("");
      } else {
        setHIndex(hIndex - 1);
        setInput(history[history.length - 1 - (hIndex - 1)]);
      }
    }

    if (e.key === "Escape") onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-80 bg-black text-green-400 font-mono z-50 border-t border-green-500">
      <div className="flex justify-between p-2 bg-zinc-900 text-xs">
        <span>LogScope Terminal</span>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="p-3 h-60 overflow-y-auto text-sm">
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-2 border-t border-zinc-700">
        <span className="mr-2">&gt;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          className="bg-transparent outline-none w-11/12 text-green-400"
        />
      </div>
    </div>
  );
}
