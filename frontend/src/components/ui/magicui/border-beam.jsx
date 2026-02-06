import { cn } from "@/lib/utils";

export function BorderBeam({
  className,
  size = 300,
  duration = 10,
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-xl",
        className
      )}
      style={{
        background: `conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent)`,
        mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        padding: "1px",
        animation: `spin ${duration}s linear infinite`,
      }}
    />
  );
}
