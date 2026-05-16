"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Home,
  User,
  FileText,
  Briefcase,
  BarChart2,
  Shield,
  Sun,
  Moon,
} from "lucide-react";

const links = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/about", label: "About", Icon: User },
  { href: "/thoughts", label: "Thoughts", Icon: FileText },
  { href: "/works", label: "Works", Icon: Briefcase },
  { href: "/analytics", label: "Analytics", Icon: BarChart2 },
  { href: "/admin", label: "Admin", Icon: Shield },
];

export default function Nav() {
  const pathname = usePathname() || "/";
  const [theme, setTheme] = useState<string>(() => {
    try {
      return localStorage.getItem("theme") || "system";
    } catch (e) {
      return "system";
    }
  });

  useEffect(() => {
    const apply = (t: string) => {
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const root = document.documentElement;
      if (t === "dark" || (t === "system" && prefersDark)) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    try {
      apply(theme);
      localStorage.setItem("theme", theme);
    } catch (e) {
      apply(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((s) => (s === "dark" ? "light" : "dark"));
  };

  return (
    <>
      {/* Desktop left fixed vertical nav (Tailwind utilities only) */}
      <nav
        role="navigation"
        aria-label="Primary"
        className="hidden md:fixed md:inset-y-0 md:left-0 md:w-20 md:flex md:flex-col md:items-center md:py-6 md:gap-1 bg-white/70 backdrop-blur-md border-r border-slate-100/60 dark:bg-slate-900/60 dark:border-slate-800/60"
      >
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <div
              key={l.href}
              className="group relative w-full flex items-center justify-center py-1"
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-[var(--apujo-blue)] rounded-r" />
              )}
              <Link
                href={l.href}
                aria-label={l.label}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-center w-10 h-10 rounded-md transition-all duration-200 ease-out ${
                  active
                    ? "bg-[var(--apujo-blue)] text-white shadow-md scale-100"
                    : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--apujo-blue)]"
                }`}
              >
                <l.Icon className="w-5 h-5" aria-hidden="true" />
              </Link>
              {/* Floating tooltip label */}
              <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md bg-slate-900 dark:bg-slate-700 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
                {l.label}
              </span>
            </div>
          );
        })}
        {/* theme toggle */}
        <button
          aria-label="Toggle theme"
          title="Toggle theme"
          onClick={toggleTheme}
          className="mt-auto mb-2 flex items-center justify-center w-10 h-10 rounded-md text-slate-700 dark:text-zinc-200 transition-all duration-200 ease-out hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </nav>

      {/* Mobile bottom-centered circular nav (Tailwind utilities only) */}
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden"
        aria-label="Mobile"
      >
        <div className="flex items-end justify-center gap-1 px-3 py-2 rounded-2xl bg-white/95 shadow-lg border border-slate-200 dark:bg-slate-900/95 dark:border-slate-800">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-label={l.label}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 ease-out ${
                  active
                    ? "bg-[var(--apujo-blue)] text-white shadow-sm"
                    : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--apujo-blue)]"
                }`}
              >
                <l.Icon className="w-5 h-5" aria-hidden="true" />
                <span className="text-[10px] leading-none font-medium">
                  {l.label}
                </span>
              </Link>
            );
          })}
          <button
            aria-label="Toggle theme"
            title="Toggle theme"
            onClick={toggleTheme}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-slate-500 dark:text-zinc-400 transition-all duration-200 ease-out hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className="text-[10px] leading-none font-medium">Theme</span>
          </button>
        </div>
      </nav>
    </>
  );
}
