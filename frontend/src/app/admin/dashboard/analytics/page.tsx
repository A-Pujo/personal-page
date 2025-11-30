"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { toast } from "react-toastify";
import Spinner from "@/components/Spinner";
import { Eye, Pencil, Trash } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  async function load() {
    setLoading(true);
    const res = await api.listAnalytic(page * pageSize, pageSize);
    if (res.ok) setItems((res as any).data || []);
    else toast.error(res.error || "Failed to load");
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function remove(slug: string) {
    if (!confirm("Delete this analytic?")) return;
    const res = await api.deleteAnalytic(slug);
    if (!res.ok) toast.error(res.error || "Delete failed");
    else {
      toast.success("Deleted");
      load();
    }
  }
  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div>
          {loading ? <Spinner /> : null}

          <div className="flex items-center justify-between mb-4 mt-2">
            <div className="text-lg font-medium">Analytics</div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/dashboard/analytics/new"
                className="px-3 py-1 border rounded bg-white"
              >
                New
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((a) => (
              <div
                key={a.id}
                className="p-4 border rounded flex justify-between"
              >
                <div>
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-sm text-zinc-600">{a.slug}</div>
                  <div className="text-sm text-zinc-500">
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    className="text-white bg-blue-600 px-2 py-1 rounded"
                    href={`/analytics/${a.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/dashboard/analytics/${a.slug}`}
                    className="text-white bg-yellow-600 px-2 py-1 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => remove(a.slug)}
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
