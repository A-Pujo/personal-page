"use client";

import React, { useEffect, useState } from "react";
import * as api from "@/lib/api";
import Spinner from "@/components/Spinner";
import { toast } from "react-toastify";

export default function Thoughts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Thought[]>([]);
  const [page, setPage] = useState(0);
  const pageSize = 8;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .listThoughts(page * pageSize, pageSize)
      .then((res) => {
        if (!mounted) return;
        if (res.ok) {
          setItems((res as any).data);
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
  }, [page]);

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
    <div className="min-h-screen px-6 py-20 bg-zinc-50">
      <main className="mx-auto max-w-100vw">
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
                <article className="lg:col-span-2 bg-white rounded overflow-hidden border border-slate-100">
                  <a href={`/thoughts/${lead.slug}`} className="block">
                    {(() => {
                      const imgUrl = resolveImg(lead.featured_img || null);
                      return imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={lead.title}
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 bg-zinc-100 flex items-center justify-center text-zinc-400">
                          No image
                        </div>
                      );
                    })()}
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-zinc-900 hover:text-[var(--apujo-blue)]">
                        {lead.title}
                      </h2>
                      <p className="text-sm text-zinc-500 mt-2 line-clamp-4">
                        {lead.excerpt}
                      </p>
                    </div>
                  </a>
                </article>

                <aside className="space-y-4">
                  {rest.slice(0, 3).map((t) => (
                    <a
                      key={t.id}
                      href={`/thoughts/${t.slug}`}
                      className="flex gap-3 items-start bg-white p-3 rounded border border-slate-100 hover:shadow-sm"
                    >
                      {(() => {
                        const u = resolveImg(t.featured_img || null);
                        return u ? (
                          <img
                            src={u}
                            className="w-24 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-24 h-16 bg-zinc-100 rounded" />
                        );
                      })()}
                      <div>
                        <h3 className="text-lg font-medium text-zinc-900">
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
                  className="block bg-white rounded overflow-hidden border border-slate-100 hover:shadow-sm"
                >
                  {(() => {
                    const uu = resolveImg(t.featured_img || null);
                    return uu ? (
                      <img src={uu} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-zinc-100" />
                    );
                  })()}
                  <div className="p-4">
                    <h3 className="font-semibold text-zinc-900">{t.title}</h3>
                    <p className="text-sm text-zinc-600 mt-1 line-clamp-3">
                      {t.excerpt}
                    </p>
                  </div>
                </a>
              ))}
            </section>

            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </button>
              <div className="text-sm">Page {page + 1}</div>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={items.length < pageSize}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
