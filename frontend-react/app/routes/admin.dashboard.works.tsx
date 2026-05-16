import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { listWorks, deleteWork } from "~/lib/api";
import Spinner from "~/components/Spinner";

const LIMIT = 10;

type Work = { id: number; slug: string; title: string; year?: string };

export default function AdminWorks() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("apujo_token"))
      navigate("/admin", { replace: true });
  }, [navigate]);

  async function fetchMore(next: number) {
    setLoading(true);
    const res = await listWorks(next, LIMIT);
    if (res.ok) {
      const data = res.data as Work[];
      if (next === 0) setItems(data);
      else setItems((prev) => [...prev, ...data]);
      if (data.length < LIMIT) setHasMore(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMore(0);
  }, []);

  async function handleDelete(slug: string) {
    if (!confirm("Delete this work?")) return;
    setDeleting(slug);
    const res = await deleteWork(slug);
    if (res.ok) setItems((prev) => prev.filter((w) => w.slug !== slug));
    setDeleting(null);
  }

  function loadMore() {
    const next = skip + LIMIT;
    setSkip(next);
    fetchMore(next);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-4">
        <Link
          to="/admin/dashboard"
          className="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          ← Dashboard
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Works</h1>
        <Link
          to="/admin/dashboard/works/new"
          className="rounded-md bg-[var(--apujo-blue)] text-white px-4 py-2 text-sm font-medium hover:bg-[#002f6f]"
        >
          + New
        </Link>
      </div>

      {loading && items.length === 0 && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      <div className="space-y-2">
        {items.map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3"
          >
            <div className="min-w-0">
              <Link
                to={`/admin/dashboard/works/${w.slug}`}
                className="font-medium hover:underline truncate block"
              >
                {w.title}
              </Link>
              {w.year && (
                <span className="text-xs text-zinc-400">{w.year}</span>
              )}
            </div>
            <div className="flex gap-2 ml-4 flex-shrink-0">
              <Link
                to={`/admin/dashboard/works/${w.slug}`}
                className="text-xs px-3 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(w.slug)}
                disabled={deleting === w.slug}
                className="text-xs px-3 py-1 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
              >
                {deleting === w.slug ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <p className="text-sm text-zinc-500 text-center py-8">No works yet.</p>
      )}

      {hasMore && !loading && (
        <button
          onClick={loadMore}
          className="mt-6 mx-auto block rounded-md border border-slate-200 dark:border-slate-700 px-5 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Load more
        </button>
      )}
      {loading && items.length > 0 && (
        <div className="flex justify-center mt-4">
          <Spinner />
        </div>
      )}
    </main>
  );
}
