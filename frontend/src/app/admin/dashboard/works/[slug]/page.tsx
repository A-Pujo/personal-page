"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import * as api from "../../../../../lib/api";
import Spinner from "../../../../../components/Spinner";
import { toast } from "react-toastify";

export default function EditWorkPage(props: any) {
  const router = useRouter();
  const { slug } = use(props.params) as { slug: string };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    images: [],
    published: false,
  });
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await api.getWork(slug);
      if (!mounted) return;
      if (!res.ok) {
        toast.error(res.error || "Failed to load");
        setLoading(false);
        return;
      }
      const w = (res as any).data;
      setForm({
        slug: w.slug,
        title: w.title,
        excerpt: w.excerpt || "",
        content: w.content || "",
        tags: (w.tags || []).join(", "),
        images: w.images || [],
        published: !!w.published,
      });
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    const ps = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews(ps);
    return () => {
      ps.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [newFiles]);

  async function handleUploadNewFiles(): Promise<string[]> {
    const uploaded: string[] = [];
    for (const f of newFiles) {
      const upl = await api.uploadImage(f);
      if (!upl.ok) {
        toast.error(upl.error || "Image upload failed");
        continue;
      }
      uploaded.push((upl as any).data?.url);
    }
    return uploaded;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: any = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      images: form.images || [],
      published: form.published,
    };

    if (newFiles.length > 0) {
      const uploaded = await handleUploadNewFiles();
      payload.images = [...(payload.images || []), ...uploaded.filter(Boolean)];
    }

    const res = await api.updateWork(slug, payload);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error || "Save failed");
      return;
    }
    toast.success("Saved");
    router.replace("/admin/dashboard/works");
  }

  if (loading)
    return (
      <div className="min-h-screen px-6 py-20">
        <main className="mx-auto max-w-3xl">
          <Spinner />
        </main>
      </div>
    );

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Edit Work</h1>
        {saving ? <Spinner /> : null}
        <form onSubmit={submit} className="space-y-3">
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="slug (lowercase-dash)"
            className="border px-2 py-1 w-full"
          />
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="title"
            className="border px-2 py-1 w-full"
          />
          <input
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="excerpt"
            className="border px-2 py-1 w-full"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="border w-full p-2"
            rows={6}
          />

          <div>
            <div className="text-sm mb-1">Existing images</div>
            <div className="flex gap-2 flex-wrap">
              {(form.images || []).map((u: string, idx: number) => (
                <div key={idx} className="w-32">
                  <img src={u} className="w-32 h-20 object-cover rounded" />
                </div>
              ))}
            </div>
          </div>

          <label className="block">
            <div className="text-sm mb-1">Add images</div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setNewFiles(files);
              }}
              className="w-full"
            />
          </label>

          {previews.length ? (
            <div className="flex gap-2 flex-wrap">
              {previews.map((p, i) => (
                <img
                  key={i}
                  src={p}
                  className="w-32 h-20 object-cover rounded"
                />
              ))}
            </div>
          ) : null}

          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="tags (comma separated)"
            className="border px-2 py-1 w-full"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm({ ...form, published: e.target.checked })
              }
            />
            Published
          </label>

          <div className="flex gap-2">
            <button className="px-3 py-2 bg-[var(--apujo-blue)] text-white rounded">
              Save
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-3 py-2 border rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
