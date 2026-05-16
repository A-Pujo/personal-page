"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { listAnalytic } from "@/lib/api";
import Spinner from "@/components/Spinner";

type FileBadge = {
  label: string;
  emoji: string;
  color: string;
  border: string;
};

function getFileBadge(fileType?: string, fileUrl?: string): FileBadge {
  if (fileType === "application/pdf" || fileUrl?.endsWith(".pdf"))
    return {
      label: "PDF",
      emoji: "📄",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      border: "border-l-red-400",
    };
  if (fileType === "text/html" || fileUrl?.endsWith(".html"))
    return {
      label: "HTML",
      emoji: "🌐",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      border: "border-l-green-400",
    };
  if (fileType === "application/json" || fileUrl?.endsWith(".ipynb"))
    return {
      label: "Notebook",
      emoji: "📓",
      color:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      border: "border-l-indigo-400",
    };
  return {
    label: "Graph",
    emoji: "📊",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    border: "border-l-orange-400",
  };
}

export default function AnalyticsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 10;

  useEffect(() => {
    fetchPage();
  }, [skip]);

  async function fetchPage() {
    setLoading(true);
    const res = await listAnalytic(skip, limit);
    if (res.ok) setItems((res as any).data || []);
    setLoading(false);
  }

  const filtered = useMemo(
    () =>
      items.filter(
        (it) =>
          it.title?.toLowerCase().includes(search.toLowerCase()) ||
          it.excerpt?.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, search],
  );

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Data reports, notebooks and PDFs
          </p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm select-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search analytics…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--apujo-blue)]/40 transition-shadow"
          />
        </div>

        {/* Item count */}
        {!loading && filtered.length > 0 && (
          <p className="text-xs text-zinc-500">
            Showing {skip + 1}–{skip + filtered.length}
          </p>
        )}

        <div className="grid gap-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">
              No results found.
            </p>
          ) : (
            filtered.map((it) => {
              const badge = getFileBadge(it.file_type, it.file_url);
              return (
                <article
                  key={it.slug}
                  className={`p-4 rounded-md bg-white dark:bg-zinc-900 border-l-4 ${badge.border} shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold text-lg leading-snug">
                      <Link
                        href={`/analytics/${it.slug}`}
                        className="hover:text-[var(--apujo-blue)] transition-colors"
                      >
                        {it.title}
                      </Link>
                    </h2>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}
                    >
                      {badge.emoji} {badge.label}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                    {it.excerpt?.substring(0, 200)}
                  </p>
                  <div className="mt-2 text-xs text-zinc-500">
                    {new Date(it.created_at).toLocaleDateString()}
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="flex justify-between">
          <button
            disabled={skip === 0}
            onClick={() => setSkip(Math.max(0, skip - limit))}
            className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 disabled:opacity-40 transition-opacity"
          >
            Previous
          </button>
          <button
            onClick={() => setSkip(skip + limit)}
            disabled={filtered.length < limit}
            className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 disabled:opacity-40 transition-opacity"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
