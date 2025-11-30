"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { listAnalytic } from "../../lib/api";

export default function AnalyticsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
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

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-sm text-zinc-600">
          Data reports, notebooks and PDFs
        </p>

        <div className="grid gap-4">
          {loading ? (
            <div>Loading...</div>
          ) : (
            items.map((it) => (
              <article
                key={it.slug}
                className="p-4 rounded-md bg-zinc-50 dark:bg-zinc-900"
              >
                <h2 className="font-medium text-lg font-bold mb-1">
                  <Link href={`/analytics/${it.slug}`}>{it.title}</Link>
                </h2>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {it.excerpt.substring(0, 200)}
                </p>
                <div className="mt-2 text-xs text-zinc-500">
                  {new Date(it.created_at).toLocaleDateString()}
                </div>
              </article>
            ))
          )}
        </div>

        <div className="flex justify-between">
          <button
            disabled={skip === 0}
            onClick={() => setSkip(Math.max(0, skip - limit))}
            className="px-3 py-1 rounded bg-zinc-100"
          >
            Previous
          </button>
          <button
            onClick={() => setSkip(skip + limit)}
            className="px-3 py-1 rounded bg-zinc-100"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}
