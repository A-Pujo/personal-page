"use client";

import React, { useEffect, useState } from "react";
import * as api from "../lib/api";

type Thought = any;

export default function ThoughtsClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Thought[]>([]);
  const [page, setPage] = useState(0);
  const pageSize = 6;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .listThoughts(page * pageSize, pageSize)
      .then((res) => {
        if (!mounted) return;
        if (res.ok) {
          setItems(res.data);
        } else {
          setError(res.error || `API error ${res.status}`);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .listThoughts(page * pageSize, pageSize)
      .then((res) => {
        if (!mounted) return;
        if (res.ok) {
          setItems(res.data);
        } else {
          setError(res.error || `API error ${res.status}`);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(String(err));
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page]);

  if (loading) return <p>Loading thoughts…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      {loading ? <p>Loading thoughts…</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((t: Thought) => (
          <article
            key={t.id}
            className="rounded-md border border-slate-100 p-4 bg-white"
          >
            <a
              href={`/thoughts/${t.slug}`}
              className="block text-lg font-medium"
            >
              {t.title}
            </a>
            <p className="text-sm text-zinc-600 mt-2">{t.excerpt}</p>
          </article>
        ))}
      </div>
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
  );
}
