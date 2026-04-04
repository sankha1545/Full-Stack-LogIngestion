import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle({ theme, toggleTheme }) {
  return (
    <Button
      variant="outline"
      size="default"
      className="h-11 gap-2 rounded-2xl px-4"
      onClick={toggleTheme}
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
