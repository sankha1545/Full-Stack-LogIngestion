import { Toaster } from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeAwareToaster() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? "#0f172a" : "#ffffff",
          color: isDark ? "#e2e8f0" : "#0f172a",
          border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
          boxShadow: isDark
            ? "0 20px 50px rgba(2, 6, 23, 0.45)"
            : "0 20px 50px rgba(15, 23, 42, 0.12)",
        },
      }}
    />
  );
}
