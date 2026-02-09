import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4" />
          Light mode
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" />
          Dark mode
        </>
      )}
    </Button>
  );
}
