import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SECTIONS = [
  { label: "Home", id: "home" },
  { label: "Features", id: "features" },
  { label: "About", id: "about" },
  { label: "How it works", id: "how-it-works" },
  { label: "Use cases", id: "use-cases" },
  { label: "Architecture", id: "architecture" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [active, setActive] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-42% 0px -42% 0px" }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  }

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-slate-950/72 backdrop-blur-xl"
          : "bg-slate-950/28 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" onClick={() => scrollToSection("home")} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-900/30">
            <div className="h-4 w-4 rounded-md bg-white/90" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight text-white">LogScope</div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-sky-200/80">Observability</div>
          </div>
        </Link>

        {pathname === "/" && (
          <div className="hidden items-center gap-6 md:flex">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`relative text-sm transition ${
                  active === section.id ? "text-white" : "text-white/65 hover:text-white"
                }`}
              >
                {section.label}
                {active === section.id && (
                  <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="rounded-2xl px-4 py-2 text-sm text-white/80 transition hover:bg-white/6 hover:text-white">
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white md:hidden">
              <Menu className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent side="right" className="border-white/10 bg-[#08111e] text-white">
              <div className="mt-10 flex flex-col gap-6">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`text-left text-lg ${active === section.id ? "text-sky-300" : "text-white/80"}`}
                  >
                    {section.label}
                  </button>
                ))}

                <div className="border-t border-white/10 pt-6">
                  <Link to="/login" className="mb-3 block text-white/80" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-medium text-slate-950"
                    onClick={() => setOpen(false)}
                  >
                    Get started
                    <ArrowRight className="h-4 w-4" />
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
