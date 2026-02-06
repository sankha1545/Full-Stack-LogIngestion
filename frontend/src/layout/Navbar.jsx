import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

// shadcn/ui
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";

const SECTIONS = [
  { label: "Home", id: "home" },
  { label: "Features", id: "features" },
  { label: "About", id: "about" },
  { label: "How it works", id: "how-it-works" },
  { label: "Use cases", id: "use-cases" },
  { label: "Architecture", id: "architecture" }
];

export default function Navbar() {
  const { pathname } = useLocation();

  const [active, setActive] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /* ---------------- Scroll transparency ---------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------------- Active section tracking ---------------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -40% 0px" }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  /* ---------------- Scroll helper ---------------- */
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false); // close mobile menu
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300
        ${scrolled
          ? "bg-black/60 backdrop-blur border-b border-white/10"
          : "bg-black/30 backdrop-blur"
        }`}
    >
      <div className="flex items-center justify-between h-16 px-6 mx-auto max-w-7xl">

        {/* ---------------- Brand ---------------- */}
        <Link
          to="/"
          onClick={() => scrollToSection("home")}
          className="flex items-center gap-2 font-bold tracking-wide"
        >
          <div className="w-8 h-8 rounded bg-indigo-600/20 ring-1 ring-indigo-500/40" />
          LogScope
        </Link>

        {/* ---------------- Desktop nav ---------------- */}
        {pathname === "/" && (
          <div className="items-center hidden gap-6 md:flex">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`text-sm transition relative
                  ${active === s.id
                    ? "text-indigo-400"
                    : "text-white/70 hover:text-white"
                  }`}
              >
                {s.label}
                {active === s.id && (
                  <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-indigo-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* ---------------- Right actions ---------------- */}
        <div className="flex items-center gap-3">

          {/* Desktop auth */}
          <div className="items-center hidden gap-3 md:flex">
            <Link
              to="/login"
              className="px-4 py-2 text-sm transition rounded bg-white/5 hover:bg-white/10"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="px-4 py-2 text-sm transition bg-indigo-600 rounded hover:bg-indigo-500"
            >
              Get started
            </Link>
          </div>

          {/* ---------------- Mobile menu ---------------- */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden">
              <Menu className="w-6 h-6 text-white" />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="bg-[#0b0f1a] border-white/10"
            >
              <div className="flex flex-col gap-6 mt-10">

                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className={`text-left text-lg
                      ${active === s.id
                        ? "text-indigo-400"
                        : "text-white/80"
                      }`}
                  >
                    {s.label}
                  </button>
                ))}

                <div className="pt-6 border-t border-white/10">
                  <Link
                    to="/login"
                    className="block mb-3 text-white/80"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="block px-4 py-2 text-center bg-indigo-600 rounded hover:bg-indigo-500"
                    onClick={() => setOpen(false)}
                  >
                    Get started
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
