import { decode } from "html-entities";
import Image from "next/image";

function resolveImg(p?: string | null) {
  if (!p) return null;
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363";
  return `${base.replace(/\/$/, "")}${p}`;
}

function decodeEntities(s: string) {
  try {
    let out = decode(s || "");
    if (out.includes("&lt;") || out.includes("&gt;") || out.includes("&amp;")) {
      out = decode(out);
    }
    return out;
  } catch (e) {
    return s || "";
  }
}

export default async function Home() {
  const BASE = (
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363"
  ).replace(/\/$/, "");

  async function fetchJson(path: string) {
    try {
      const res = await fetch(path, { next: { revalidate: 60 } });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      return [];
    }
  }

  const [works, thoughts, analytics] = await Promise.all([
    fetchJson(`${BASE}/api/works/?limit=3`),
    fetchJson(`${BASE}/api/thoughts/?limit=3`),
    fetchJson(`${BASE}/api/analytics/?limit=4`),
  ]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-6 py-20">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-black dark:text-zinc-50">
              A-Pujo
            </h1>
            <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400 tracking-wide">
              Public Finance × Tech × Economics
            </p>
            <p className="text-lg text-zinc-700 dark:text-zinc-300 max-w-xl">
              Markets move in ways that often seem random, and life mirrors that
              unpredictability. I channel my curiosity into building things and
              exploring the intersection of technology and economics.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/about"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--apujo-blue)] text-white px-4 py-2 text-sm font-medium hover:bg-[#002f6f]"
              >
                About
              </a>
              <a
                href="/thoughts"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-zinc-200 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                Thoughts
              </a>
              <a
                href="/analytics"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-zinc-200 dark:border-slate-800 dark:hover:bg-slate-800"
              >
                Analytics →
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-56 h-56 rounded-full ring-4 ring-[var(--apujo-blue)]/20 shadow-xl overflow-hidden">
              <Image
                src="/img/pujo-pas-foto.jpg"
                alt="Aln Pujo Priambodo"
                fill
                className="object-cover object-top"
                priority
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
                  <a
                    href={`/works/${w.slug}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {w.title}
                  </a>
                  <p className="text-sm text-zinc-600 mt-2 line-clamp-2">
                    {decodeEntities(w.excerpt || w.description || "").replace(
                      /<[^>]+>/g,
                      "",
                    )}
                  </p>
                  {w.year ? (
                    <div className="mt-2 inline-block text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {w.year}
                    </div>
                  ) : null}
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
                  <a
                    href={`/thoughts/${t.slug}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {t.title}
                  </a>
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

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Latest Analytics
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Array.isArray(analytics) && analytics.length > 0 ? (
              analytics.map((a: any) => {
                const isNotebook =
                  a.file_type === "application/json" ||
                  a.file_url?.endsWith(".ipynb");
                const isHtml =
                  a.file_type === "text/html" || a.file_url?.endsWith(".html");
                const isPdf = a.file_type === "application/pdf";
                const badge = isNotebook
                  ? {
                      emoji: "📓",
                      label: "Notebook",
                      color:
                        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
                    }
                  : isHtml
                    ? {
                        emoji: "🌐",
                        label: "HTML",
                        color:
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                      }
                    : isPdf
                      ? {
                          emoji: "📄",
                          label: "PDF",
                          color:
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                        }
                      : {
                          emoji: "📊",
                          label: "Graph",
                          color:
                            "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                        };
                return (
                  <article
                    key={a.slug}
                    className="rounded-md border border-slate-100 p-4 bg-white dark:bg-slate-900 dark:border-slate-800 flex items-start gap-3"
                  >
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${badge.color}`}
                    >
                      {badge.emoji} {badge.label}
                    </span>
                    <div className="min-w-0">
                      <a
                        href={`/analytics/${a.slug}`}
                        className="text-base font-medium hover:underline line-clamp-1"
                      >
                        {a.title}
                      </a>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                        {a.excerpt}
                      </p>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="text-sm text-zinc-500">No analytics found.</div>
            )}
          </div>
          <a
            href="/analytics"
            className="mt-4 inline-block text-sm text-[var(--apujo-blue)] hover:underline"
          >
            View all analytics →
          </a>
        </section>
      </main>
    </div>
  );
}
