import { useRef } from "react";

export default function OtpInput({ value = "", onChange }) {
  const inputs = useRef([]);

  function handleChange(index, e) {
    const digit = e.target.value.replace(/\D/g, "");
    if (!digit) return;

    const next = value.split("");
    next[index] = digit[0];
    onChange(next.join(""));

    if (index < 3) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d{4}$/.test(text)) return;
    onChange(text);
    inputs.current[3]?.focus();
  }

  return (
    <div className="flex justify-center gap-3" onPaste={handlePaste}>
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-12 text-xl text-center border rounded-lg bg-white/5 border-white/15 focus:ring-2 focus:ring-indigo-500"
        />
      ))}
    </div>
  );
}
