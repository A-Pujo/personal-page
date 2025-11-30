import { decode } from "html-entities";

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

  const [works, thoughts] = await Promise.all([
    fetchJson(`${BASE}/api/works/?limit=3`),
    fetchJson(`${BASE}/api/thoughts/?limit=3`),
  ]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-6 py-20">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-black dark:text-zinc-50">
              A-Pujo
            </h1>
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
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Thoughts
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-[var(--apujo-red)] to-[var(--apujo-blue)] shadow-lg flex items-center justify-center text-white text-xl font-semibold">
              PJ
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
                  className="rounded-md border border-slate-100 p-4 bg-white"
                >
                  <a
                    href={`/works/${w.slug}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {w.title}
                  </a>
                  <p className="text-sm text-zinc-600 mt-2 line-clamp-3">
                    {decodeEntities(w.excerpt || w.description || "").replace(
                      /<[^>]+>/g,
                      ""
                    )}
                  </p>
                  {w.year ? (
                    <div className="text-xs text-zinc-500 mt-2">{w.year}</div>
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
                  className="rounded-md border border-slate-100 p-4 bg-white"
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
      </main>
    </div>
  );
}
