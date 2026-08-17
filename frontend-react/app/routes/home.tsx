import { useEffect, useState } from "react";
import { Link } from "react-router";
import { decode } from "html-entities";
import type { Route } from "./+types/home";
import { mergeMeta, pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = ({ matches }) =>
  mergeMeta(
    matches,
    pageMeta({
      title: "A-Pujo",
      description:
        "Public servant at the Indonesian Ministry of Finance, published fiscal-policy researcher, and full-stack developer bridging data engineering with economic analysis.",
      path: "/",
    }),
  );

const API_BASE =
  (import.meta.env.VITE_API_BASE as string) || "http://localhost:6363";

function resolveImg(p?: string | null) {
  if (!p) return null;
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  return `${API_BASE.replace(/\/$/, "")}${p}`;
}

function decodeEntities(s: string) {
  try {
    let out = decode(s || "");
    if (out.includes("&lt;") || out.includes("&gt;") || out.includes("&amp;")) {
      out = decode(out);
    }
    return out;
  } catch {
    return s || "";
  }
}

export default function Home() {
  const [works, setWorks] = useState<any[]>([]);
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);

  useEffect(() => {
    async function fetchJson(path: string) {
      try {
        const res = await fetch(path);
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    }
    Promise.all([
      fetchJson(`${API_BASE}/api/works/?limit=3`),
      fetchJson(`${API_BASE}/api/thoughts/?limit=3`),
      fetchJson(`${API_BASE}/api/analytics/?limit=4`),
    ]).then(([w, t, a]) => {
      setWorks(w);
      setThoughts(t);
      setAnalytics(a);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-6 py-20">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-black dark:text-zinc-50">
              A-Pujo
            </h1>
            <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 tracking-wide">
              Web Dev · Independent Researcher · Financial Data Analyst
            </p>
            <p className="text-lg text-zinc-700 dark:text-zinc-300 max-w-xl">
              Public servant at the Indonesian Ministry of Finance. Published
              researcher in fiscal policy and macroeconomics. Full-stack
              developer and database administrator bridging data engineering
              with economic analysis.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--apujo-blue)] text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--apujo-red)]"
              >
                About
              </Link>
              <Link
                to="/thoughts"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[var(--apujo-red)] hover:text-[var(--apujo-red)] dark:text-zinc-200 dark:border-slate-700 dark:hover:border-[var(--apujo-red)] dark:hover:text-red-400"
              >
                Thoughts
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-[var(--apujo-red)] hover:text-[var(--apujo-red)] dark:text-zinc-200 dark:border-slate-700 dark:hover:border-[var(--apujo-red)] dark:hover:text-red-400"
              >
                Analytics →
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-56 h-56 rounded-full ring-4 ring-[var(--apujo-blue)]/20 shadow-xl overflow-hidden">
              <img
                src="/img/pujo-pas-foto.jpg"
                alt="Aln Pujo Priambodo"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Latest Works
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {Array.isArray(works) && works.length > 0 ? (
              works.map((w: any) => (
                <article
                  key={w.id}
                  className="rounded-md border border-slate-100 p-4 bg-white dark:bg-slate-900 dark:border-slate-800"
                >
                  <Link
                    to={`/works/${w.slug}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {w.title}
                  </Link>
                  <p className="text-sm text-zinc-600 mt-2 line-clamp-2">
                    {decodeEntities(w.excerpt || w.description || "").replace(
                      /<[^>]+>/g,
                      "",
                    )}
                  </p>
                  {w.year && (
                    <div className="mt-2 inline-block text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {w.year}
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="text-sm text-zinc-500">No works found.</div>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Latest Thoughts
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {Array.isArray(thoughts) && thoughts.length > 0 ? (
              thoughts.map((t: any) => (
                <article
                  key={t.id}
                  className="rounded-md border border-slate-100 p-4 bg-white dark:bg-slate-900 dark:border-slate-800"
                >
                  <Link
                    to={`/thoughts/${t.slug}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {t.title}
                  </Link>
                  <p className="text-sm text-zinc-600 mt-2 line-clamp-3">
                    {decodeEntities(t.excerpt || "").replace(/<[^>]+>/g, "")}
                  </p>
                </article>
              ))
            ) : (
              <div className="text-sm text-zinc-500">No thoughts found.</div>
            )}
          </div>
        </section>

        {Array.isArray(analytics) && analytics.length > 0 && (
          <section className="mt-10">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Latest Analytics
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {analytics.map((a: any) => (
                <article
                  key={a.id}
                  className="rounded-md border border-slate-100 p-4 bg-white dark:bg-slate-900 dark:border-slate-800"
                >
                  <Link
                    to={`/analytics/${a.slug}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {a.title}
                  </Link>
                  <p className="text-sm text-zinc-600 mt-1 line-clamp-2">
                    {a.excerpt}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
