import { cn } from "@/lib/utils";

export function AnimatedGradientText({ children, className }) {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient",
        className
      )}
    >
      {children}
    </span>
  );
}
