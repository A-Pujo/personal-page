"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  FileText,
  Briefcase,
  BarChart2,
  Shield,
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

  return (
    <>
      {/* Desktop left fixed vertical nav (Tailwind utilities only) */}
      <nav
        role="navigation"
        aria-label="Primary"
        className="hidden md:fixed md:inset-y-0 md:left-0 md:w-20 md:flex md:flex-col md:items-center md:py-6 md:gap-4 bg-white/70 backdrop-blur-md border-r border-slate-100/60"
      >
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-label={l.label}
              title={l.label}
              aria-current={active ? "page" : undefined}
              className={`flex items-center justify-center w-10 h-10 rounded-md text-slate-700 transition-all duration-150 ease-in-out transform ${
                active
                  ? "bg-[var(--apujo-blue)] text-white shadow-sm bg-opacity-10"
                  : "hover:bg-[var(--apujo-red)] hover:bg-opacity-10 hover:text-white hover:-translate-y-0.5"
              }`}
            >
              <l.Icon className="w-5 h-5" aria-hidden="true" />
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom-centered circular nav (Tailwind utilities only) */}
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden"
        aria-label="Mobile"
      >
        <div className="flex items-center justify-center w-auto h-16 rounded-full bg-white/95 shadow-lg border border-slate-200">
          <div className="flex gap-4 px-2">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-label={l.label}
                  title={l.label}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-slate-700 transition-colors duration-150 ${
                    active
                      ? "bg-[var(--apujo-blue)] text-white bg-opacity-10"
                      : "hover:bg-[var(--apujo-red)] hover:bg-opacity-10 hover:text-white"
                  }`}
                >
                  <l.Icon className="w-5 h-5" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
