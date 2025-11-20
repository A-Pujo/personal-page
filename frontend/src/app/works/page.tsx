"use client";
import React, { useEffect, useState } from "react";
import Spinner from "../../components/Spinner";
import { toast } from "react-toastify";

type Work = {
  id: number;
  title: string;
  excerpt?: string | null;
  year?: string | null;
  images?: string[] | null;
  slug?: string;
};

const resolveImg = (p?: string | null) => {
  if (!p) return null;
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363";
  return `${base}${p}`;
};

export default function WorksPage() {
  const [items, setItems] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363";
    fetch(`${base}/api/works/`)
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
    <div className="min-h-screen px-6 py-20 bg-zinc-50">
      <main className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold">Works</h1>
          <p className="text-zinc-600 mt-1">
            Selected projects and pieces — tap any to learn more.
          </p>
        </header>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((w) => {
            const img =
              w.images && w.images.length > 0 ? resolveImg(w.images[0]) : null;
            return (
              <article
                key={w.id}
                className="rounded-lg border border-slate-100 p-4 bg-white flex flex-col md:flex-row gap-4 hover:shadow transition-shadow"
              >
                <div className="flex-shrink-0">
                  {img ? (
                    <a href={`/works/${w.slug || ""}`} className="block">
                      <img
                        src={img}
                        alt={w.title}
                        className="w-48 h-32 object-cover rounded-md"
                      />
                    </a>
                  ) : (
                    <div className="w-48 h-32 bg-zinc-100 rounded-md flex items-center justify-center text-zinc-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <a
                    href={`/works/${w.slug || ""}`}
                    className="text-2xl font-semibold hover:underline"
                  >
                    {w.title}
                  </a>
                  <p className="text-sm text-zinc-600 mt-2 line-clamp-4">
                    {w.excerpt}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    {w.year ? (
                      <span className="text-xs text-zinc-500">{w.year}</span>
                    ) : null}
                    <a
                      href={`/works/${w.slug || ""}`}
                      className="text-sm text-blue-600"
                    >
                      View project →
                    </a>
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
