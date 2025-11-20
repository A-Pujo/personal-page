"use client";
import React, { useEffect, useRef, useState } from "react";
import * as api from "../../../../../lib/api";
import { useRouter } from "next/navigation";
import Spinner from "../../../../../components/Spinner";
import { toast } from "react-toastify";

export default function NewThoughtPage() {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    featured_img: "",
    published: false,
  });
  const [slugEdited, setSlugEdited] = useState(false);

  function slugifyTitle(title: string) {
    if (!title) return "";
    let s = title.toLowerCase();
    s = s.replace(/[^a-z0-9]+/g, "-");
    s = s.replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (s.length > 50) s = s.slice(0, 50).replace(/-$/g, "");
    return s;
  }

  // auto-generate slug from title + date when user hasn't edited slug
  useEffect(() => {
    if (slugEdited) return;
    const titlePart = slugifyTitle(form.title || "");
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const generated = titlePart ? `${titlePart}-${datePart}` : datePart;
    setForm((f) => ({ ...f, slug: generated }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title, slugEdited]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function ensure() {
      if (typeof (window as any).tinymce === "undefined") {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "/js/tinymce/tinymce.min.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Failed to load tinymce"));
          document.head.appendChild(s);
        });
      }
      if (!mounted) return;
      const tm = (window as any).tinymce;
      try {
        tm.init({
          license_key: "gpl",
          selector: "#new-thought-content",
          menubar: false,
          plugins: ["link", "lists", "code", "image", "autoresize"],
          toolbar:
            "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
          setup(editor: any) {
            editorRef.current = editor;
            editor.on("Change KeyUp", () => {
              const content = editor.getContent();
              setForm((f) => ({ ...f, content }));
            });
          },
          init_instance_callback(editor: any) {
            editor.setContent(form.content || "");
          },
        });
      } catch {}
    }
    ensure();
    return () => {
      mounted = false;
      try {
        const tm = (window as any).tinymce;
        if (tm && editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload: any = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      featured_img: form.featured_img || null,
      published: form.published,
    };

    if (selectedFile) {
      const upl = await api.uploadImage(selectedFile);
      if (!upl.ok) {
        toast.error(upl.error || "Image upload failed");
        setLoading(false);
        return;
      }
      payload.featured_img = (upl as any).data?.url || null;
    }

    const res = await api.createThought(payload);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Save failed");
      return;
    }
    router.replace("/admin/dashboard/thoughts");
  }

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">New Thought</h1>
        {loading ? <Spinner /> : null}
        <form onSubmit={submit} className="space-y-3">
          <input
            value={form.slug}
            onChange={(e) => {
              setForm({ ...form, slug: e.target.value });
              setSlugEdited(true);
            }}
            placeholder="slug (lowercase-dash)"
            className="border px-2 py-1 w-full"
          />
          <input
            value={form.title}
            onChange={(e) => {
              setForm({ ...form, title: e.target.value });
            }}
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
            id="new-thought-content"
            className="border w-full p-2"
            rows={8}
          />
          <label className="block">
            <div className="text-sm mb-1">Featured image (optional)</div>
            <input
              type="file"
              accept="image/*"
              className="text-[var(--apujo-blue)] border border-[var(--apujo-blue)] px-2 py-1 w-full"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setSelectedFile(f);
                if (f) setPreviewUrl(URL.createObjectURL(f));
                else setPreviewUrl(null);
              }}
            />
          </label>
          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="w-48 h-auto mt-2" />
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
              Create
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
