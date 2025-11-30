"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as api from "../../../../../lib/api";
import { toast } from "react-toastify";

export default function CreateAnalyticPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    tags: "",
    published: false,
  });
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (slugEdited) return;
    const titlePart = slugifyTitle(form.title || "");
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const generated = titlePart ? `${titlePart}-${datePart}` : datePart;
    setForm((f) => ({ ...f, slug: generated }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title, slugEdited]);

  function slugifyTitle(title: string) {
    if (!title) return "";
    let s = title.toLowerCase();
    s = s.replace(/[^a-z0-9]+/g, "-");
    s = s.replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (s.length > 50) s = s.slice(0, 50).replace(/-$/g, "");
    return s;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // require file upload (backend expects file for analytics)
      const fcheck = fileRef.current?.files?.[0];
      if (!fcheck) {
        toast.error("Please select a file (PDF or .ipynb)");
        setLoading(false);
        return;
      }
      const fd = new FormData();
      fd.append("title", form.title);
      if (form.slug) fd.append("slug", form.slug);
      if (form.excerpt) fd.append("excerpt", form.excerpt);
      if (form.tags) fd.append("tags", form.tags);
      fd.append("published", form.published ? "1" : "0");
      const f = fcheck;
      fd.append("file", f);
      const res = await api.createAnalytic(fd);
      if (!res.ok) {
        toast.error(res.error || "Create failed");
      } else {
        toast.success("Created");
        router.push("/admin/dashboard/analytics");
      }
    } catch (err: any) {
      toast.error(err?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Create Analytic</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm">Title</label>
            <input
              required
              className="w-full p-2 border rounded"
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({ ...f, title }));
                if (!slugEdited)
                  setForm((f) => ({ ...f, slug: slugifyTitle(title) }));
              }}
            />
          </div>
          <div>
            <label className="block text-sm">Slug</label>
            <input
              className="w-full p-2 border rounded"
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setForm((f) => ({ ...f, slug: e.target.value }));
              }}
            />
          </div>
          <div>
            <label className="block text-sm">Excerpt</label>
            <textarea
              className="w-full p-2 border rounded"
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
            <label className="block text-sm">File</label>
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
              Create
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
