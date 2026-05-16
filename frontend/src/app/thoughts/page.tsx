"use client";

import React, { useEffect, useState } from "react";
import * as api from "@/lib/api";
import Spinner from "@/components/Spinner";
import { toast } from "react-toastify";

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function Thoughts() {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Thought[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 8;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .listThoughts(0, pageSize)
      .then((res) => {
        if (!mounted) return;
        if (res.ok) {
          const data = (res as any).data;
          setItems(data);
          setHasMore(data.length === pageSize);
        } else {
          setError(res.error || `API error ${res.status}`);
          toast.error(res.error || `API error ${res.status}`);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
        toast.error(String(err));
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function loadMore() {
    setLoadingMore(true);
    api
      .listThoughts(items.length, pageSize)
      .then((res) => {
        if (res.ok) {
          const data = (res as any).data;
          setItems((prev) => [...prev, ...data]);
          setHasMore(data.length === pageSize);
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
  if (error) return <p className="text-red-600">{error}</p>;

  // Newspaper layout: lead story + grid
  const lead = items[0];
  const rest = items.slice(1);

  const resolveImg = (p?: string | null) => {
    if (!p) return null;
    if (p.startsWith("http") || p.startsWith("data:")) return p;
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363";
    return `${base}${p}`;
  };

  type Thought = any;
  return (
    <div className="min-h-screen px-6 py-20 bg-zinc-50 dark:bg-zinc-900">
      <main className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold leading-tight mb-2">
            Thoughts
          </h1>
          <p className="text-zinc-600">
            A curated collection of ideas and clearance.
          </p>
        </header>

        <section className="space-y-6">
          <div>
            {lead ? (
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <article className="lg:col-span-2 bg-white rounded overflow-hidden border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                  <a href={`/thoughts/${lead.slug}`} className="block">
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
                  </a>
                </article>

                <aside className="space-y-4">
                  {rest.slice(0, 3).map((t) => (
                    <a
                      key={t.id}
                      href={`/thoughts/${t.slug}`}
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
                    </a>
                  ))}
                </aside>
              </section>
            ) : null}

            <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.slice(3).map((t) => (
                <a
                  key={t.id}
                  href={`/thoughts/${t.slug}`}
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
                    <h3 className="font-semibold text-zinc-900">{t.title}</h3>
                    <p className="text-sm text-zinc-600 mt-1 line-clamp-2">
                      {t.excerpt}
                    </p>
                    {t.excerpt && (
                      <span className="mt-2 inline-block text-xs text-zinc-400">
                        {readingTime(t.excerpt)} min read
                      </span>
                    )}
                  </div>
                </a>
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
