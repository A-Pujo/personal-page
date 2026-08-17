import { useEffect, useState } from "react";
import { Link } from "react-router";
import { listThoughts } from "~/lib/api";
import { API_BASE } from "~/lib/api";
import Spinner from "~/components/Spinner";
import { toast } from "react-toastify";
import type { Route } from "./+types/thoughts";
import { mergeMeta, pageMeta } from "~/lib/meta";

export const meta: Route.MetaFunction = ({ matches }) =>
  mergeMeta(
    matches,
    pageMeta({
      title: "Thoughts",
      description:
        "Essays and notes from Aln Pujo Priambodo on public finance, data engineering, and fiscal policy research.",
      path: "/thoughts",
    }),
  );

const PAGE_SIZE = 8;

type Thought = any;

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function resolveImg(p?: string | null) {
  if (!p) return null;
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  return `${API_BASE}${p}`;
}

export default function Thoughts() {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [items, setItems] = useState<Thought[]>([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    listThoughts(0, PAGE_SIZE)
      .then((res) => {
        if (res.ok) {
          const data = (res as any).data;
          setItems(data);
          setHasMore(data.length === PAGE_SIZE);
        } else {
          toast.error((res as any).error || "Failed to load thoughts");
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error(String(err));
        setLoading(false);
      });
  }, []);

  function loadMore() {
    setLoadingMore(true);
    listThoughts(items.length, PAGE_SIZE)
      .then((res) => {
        if (res.ok) {
          const data = (res as any).data;
          setItems((prev) => [...prev, ...data]);
          setHasMore(data.length === PAGE_SIZE);
        }
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  }

  if (loading)
    return (
      <div className="p-4">
        <Spinner />
      </div>
    );

  const lead = items[0];
  const rest = items.slice(1);

  return (
    <div className="min-h-screen px-6 py-20 bg-zinc-50 dark:bg-zinc-900">
      <main className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold leading-tight text-black dark:text-zinc-50 mb-2">
            Thoughts
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            A curated collection of ideas and clearance.
          </p>
        </header>

        <section className="space-y-6">
          <div>
            {lead && (
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <article className="lg:col-span-2 bg-white rounded overflow-hidden border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                  <Link to={`/thoughts/${lead.slug}`} className="block">
                    {(() => {
                      const imgUrl = resolveImg(lead.featured_img || null);
                      return imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={lead.title}
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-zinc-100 flex items-center justify-center text-zinc-400 dark:bg-zinc-800 dark:text-zinc-400">
                          No image
                        </div>
                      );
                    })()}
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 hover:text-[var(--apujo-blue)] transition-colors">
                        {lead.title}
                      </h2>
                      <p className="text-sm text-zinc-500 mt-2 line-clamp-4">
                        {lead.excerpt}
                      </p>
                      {lead.excerpt && (
                        <span className="mt-3 inline-block text-xs text-zinc-400">
                          {readingTime(lead.excerpt)} min read
                        </span>
                      )}
                    </div>
                  </Link>
                </article>

                <aside className="space-y-4">
                  {rest.slice(0, 3).map((t: Thought) => (
                    <Link
                      key={t.id}
                      to={`/thoughts/${t.slug}`}
                      className="flex gap-3 items-start bg-white p-3 rounded border border-slate-100 hover:shadow-sm dark:bg-slate-900 dark:border-slate-800"
                    >
                      {(() => {
                        const u = resolveImg(t.featured_img || null);
                        return u ? (
                          <img
                            src={u}
                            className="w-24 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-24 h-16 bg-zinc-100 rounded dark:bg-zinc-800" />
                        );
                      })()}
                      <div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50 hover:text-[var(--apujo-blue)] transition-colors">
                          {t.title}
                        </h3>
                        <p className="text-xs text-zinc-500 line-clamp-3">
                          {t.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </aside>
              </section>
            )}

            <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.slice(3).map((t: Thought) => (
                <Link
                  key={t.id}
                  to={`/thoughts/${t.slug}`}
                  className="block bg-white rounded overflow-hidden border border-slate-100 hover:shadow-sm dark:bg-slate-900 dark:border-slate-800"
                >
                  {(() => {
                    const uu = resolveImg(t.featured_img || null);
                    return uu ? (
                      <img src={uu} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-zinc-100 dark:bg-zinc-800" />
                    );
                  })()}
                  <div className="p-4">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                      {t.title}
                    </h3>
                    <p className="text-sm text-zinc-600 mt-1 line-clamp-2">
                      {t.excerpt}
                    </p>
                    {t.excerpt && (
                      <span className="mt-2 inline-block text-xs text-zinc-400">
                        {readingTime(t.excerpt)} min read
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </section>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  className="px-5 py-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-sm font-medium disabled:opacity-50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  disabled={loadingMore}
                  onClick={loadMore}
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
