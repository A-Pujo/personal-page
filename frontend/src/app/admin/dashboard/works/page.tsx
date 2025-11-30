"use client";
import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import { toast } from "react-toastify";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { Eye, Pencil, Trash, ArrowLeft } from "lucide-react";

export default function AdminWorksPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.listWorks(page * pageSize, pageSize);
    if (res.ok) setItems((res as any).data);
    else toast.error(res.error || "Failed to load");
    setLoading(false);
  }

  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function remove(slug: string) {
    const res = await api.deleteWork(slug);
    if (!res.ok) toast.error(res.error || "Delete failed");
    else {
      toast.success("Deleted");
      load();
    }
  }
  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="text-sm text-zinc-600 hover:text-[var(--apujo-red)]"
          >
            <ArrowLeft className="inline" /> back
          </Link>
        </div>
        <div className="mb-4 flex items-center gap-4">
          <h1 className="text-2xl font-bold">Manage Works</h1>
          <div className="ml-auto">
            <Link
              href="/admin/dashboard/works/new"
              className="px-3 py-1 bg-[var(--apujo-blue)] text-white rounded text-sm"
            >
              New Work
            </Link>
          </div>
        </div>
        <div>
          {loading ? <Spinner /> : null}
          <div className="space-y-4 mt-4">
            {items.map((w) => (
              <div
                key={w.id}
                className="p-4 border rounded flex justify-between"
              >
                <div>
                  <div className="font-semibold">{w.title}</div>
                  <div className="text-sm text-zinc-600">{w.slug}</div>
                  <div className="text-sm text-zinc-500">
                    {w.year} • {w.repo || w.url}
                  </div>
                  <div className="text-xs text-zinc-400 mt-2">
                    Tech: {(w.tech || []).join(", ")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    className="text-white bg-blue-600 px-2 py-1 rounded"
                    href={`/works/${w.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/dashboard/works/${w.slug}`}
                    className="text-white bg-yellow-600 px-2 py-1 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => remove(w.slug)}
                    className="text-red-600"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-end gap-2 mt-4">
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
        </div>
      </main>
    </div>
  );
}
