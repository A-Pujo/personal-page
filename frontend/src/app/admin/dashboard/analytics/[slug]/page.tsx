"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import * as api from "@/lib/api";
import { toast } from "react-toastify";

export default function EditAnalyticPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || "";
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    tags: "",
    published: false,
    existingFileUrl: "",
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await api.getAnalytic(slug);
      if (res.ok && mounted) {
        const it = (res as any).data;
        setForm({
          title: it.title || "",
          slug: it.slug || "",
          excerpt: it.excerpt || "",
          tags: (it.tags || []).join
            ? (it.tags || []).join(",")
            : it.tags || "",
          published: !!it.published,
          existingFileUrl: it.file_url || "",
        });
      }
      setLoading(false);
    }
    if (slug) load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      if (form.title) fd.append("title", form.title);
      if (form.slug && form.slug !== slug) fd.append("new_slug", form.slug);
      if (form.excerpt) fd.append("excerpt", form.excerpt);
      if (form.tags) fd.append("tags", form.tags);
      fd.append("published", form.published ? "1" : "0");
      const f = fileRef.current?.files?.[0];
      if (f) fd.append("file", f);
      const res = await api.updateAnalytic(slug, fd);
      if (!res.ok) toast.error(res.error || "Save failed");
      else {
        toast.success("Updated");
        router.push("/admin/dashboard/analytics");
      }
    } catch (err: any) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="min-h-screen px-6 py-20">Loading...</div>;

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Edit Analytic</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm">Slug</label>
            <input
              className="bg-gray-200 w-full p-2 border rounded"
              value={form.slug}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm">Title</label>
            <input
              required
              className="w-full p-2 border rounded"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm">Excerpt</label>
            <textarea
              className="w-full p-2 border rounded"
              rows={10}
              value={form.excerpt}
              onChange={(e) =>
                setForm((f) => ({ ...f, excerpt: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm">Tags</label>
            <input
              className="w-full p-2 border rounded"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((f) => ({ ...f, published: e.target.checked }))
                }
              />{" "}
              Published
            </label>
          </div>
          <div>
            <label className="block text-sm">Existing file: </label>
            {form.existingFileUrl ? (
              <a
                className="text-[var(--apujo-blue)]"
                href={`${api.API_BASE}${form.existingFileUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                view
              </a>
            ) : (
              "none"
            )}
          </div>
          <div>
            <label className="block text-sm">Replace File</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.ipynb,application/pdf,application/json"
            />
          </div>
          <div>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-[var(--apujo-blue)] text-white"
            >
              Save
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
