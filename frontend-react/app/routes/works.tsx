import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import Spinner from "~/components/Spinner";
import { API_BASE } from "~/lib/api";
import type { Route } from "./+types/works";
import { mergeMeta, pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = ({ matches }) =>
  mergeMeta(
    matches,
    pageMeta({
      title: "Works",
      description:
        "Selected projects and technical work by Aln Pujo Priambodo — full-stack development, data engineering, and treasury systems.",
      path: "/works",
    }),
  );

type Work = {
  id: number;
  title: string;
  excerpt?: string | null;
  year?: string | null;
  images?: string[] | null;
  slug?: string;
};

function resolveImg(p?: string | null) {
  if (!p) return null;
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  return `${API_BASE}${p}`;
}

export default function Works() {
  const [items, setItems] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/works/`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => setItems(data || []))
      .catch((err) => {
        setItems([]);
        toast.error(err?.message || "Failed to load works");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-6">
        <Spinner />
      </div>
    );

  return (
    <div className="min-h-screen px-6 py-20 bg-zinc-50 dark:bg-zinc-900">
      <main className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold text-black dark:text-zinc-50">
            Works
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Selected projects and pieces — tap any to learn more.
          </p>
        </header>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((w) => {
            const img =
              w.images && w.images.length > 0 ? resolveImg(w.images[0]) : null;
            return (
              <article
                key={w.id}
                className="group rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col hover:ring-2 hover:ring-[var(--apujo-blue)] hover:scale-[1.01] transition-all duration-200"
              >
                <Link to={`/works/${w.slug || ""}`} className="block">
                  {img ? (
                    <img
                      src={img}
                      alt={w.title}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm">
                      No image
                    </div>
                  )}
                </Link>
                <div className="flex flex-col flex-1 p-4">
                  <Link
                    to={`/works/${w.slug || ""}`}
                    className="font-semibold text-base hover:text-[var(--apujo-blue)] transition-colors line-clamp-2"
                  >
                    {w.title}
                  </Link>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-3 flex-1">
                    {w.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    {w.year ? (
                      <span className="text-xs text-zinc-500">{w.year}</span>
                    ) : (
                      <span />
                    )}
                    <Link
                      to={`/works/${w.slug || ""}`}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-[var(--apujo-blue)] text-white rounded-md px-3 py-1 hover:bg-[#002f6f] transition-colors"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
