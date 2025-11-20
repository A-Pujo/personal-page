"use client";
import React, { useEffect, useRef, useState, use } from "react";
import { decode } from "html-entities";
import { useRouter } from "next/navigation";
import * as api from "../../../../../lib/api";
import Spinner from "../../../../../components/Spinner";
import { toast } from "react-toastify";

const resolveImg = (p?: string | null) => {
  if (!p) return null;
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363";
  return `${base}${p}`;
};

// use `html-entities` to decode HTML entities
function decodeEntities(s: string) {
  try {
    return decode(s || "");
  } catch {
    return s;
  }
}

export default function EditThoughtPage(props: any) {
  const router = useRouter();
  const { slug } = use(props.params) as { slug: string };
  const editorRef = useRef<any>(null);
  const formRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    tags: [],
    featured_img: "",
    published: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const res = await api.getThought(slug);
      if (!mounted) return;
      if (!res.ok) {
        toast.error(res.error || "Failed to load");
        setLoading(false);
        return;
      }
      const t = (res as any).data;
      setForm({
        slug: t.slug,
        title: t.title,
        excerpt: t.excerpt || "",
        content: decodeEntities(t.content || ""),
        tags: (t.tags || []).join(", "),
        featured_img: t.featured_img || "",
        published: !!t.published,
      });
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  // keep a ref to latest form so init callback can read current content
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  // when form.content changes and editor exists, push it into TinyMCE
  useEffect(() => {
    try {
      const tm = (window as any).tinymce;
      if (
        tm &&
        editorRef.current &&
        typeof editorRef.current.setContent === "function"
      ) {
        // only update editor content when different to avoid feedback loops
        try {
          const current =
            typeof editorRef.current.getContent === "function"
              ? editorRef.current.getContent()
              : null;
          if (current !== (form.content || "")) {
            editorRef.current.setContent(form.content || "");
          }
        } catch {
          editorRef.current.setContent(form.content || "");
        }
      }
    } catch {}
    // only re-run when the content changes
  }, [form.content]);

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
          selector: "#edit-thought-content",
          menubar: false,
          plugins: ["link", "lists", "code", "image", "autoresize"],
          toolbar:
            "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
          setup(editor: any) {
            editorRef.current = editor;
            const handler = () => {
              const content = editor.getContent();
              setForm((f: any) => ({ ...f, content }));
            };
            editor.on("Change", handler);
            editor.on("KeyUp", handler);
          },
          init_instance_callback(editor: any) {
            // read the latest form content from the ref to avoid closure staleness
            const initial = formRef.current?.content || "";
            editor.setContent(initial);
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
  }, []);

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
      featured_img: form.featured_img || null,
      published: form.published,
    };

    if (selectedFile) {
      const upl = await api.uploadImage(selectedFile);
      if (!upl.ok) {
        toast.error(upl.error || "Image upload failed");
        setSaving(false);
        return;
      }
      payload.featured_img = (upl as any).data?.url || null;
    }

    const res = await api.updateThought(slug, payload);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error || "Save failed");
      return;
    }
    toast.success("Saved");
    router.replace("/admin/dashboard/thoughts");
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
        <h1 className="text-2xl font-bold mb-4">Edit Thought</h1>
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
            id="edit-thought-content"
            className="border w-full p-2"
            rows={8}
          />
          <label className="block">
            <div className="text-sm mb-1">
              Replace featured image (optional)
            </div>
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
          ) : form.featured_img ? (
            <img
              src={resolveImg(form.featured_img || null) || undefined}
              alt="current"
              className="w-48 h-auto mt-2"
            />
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
