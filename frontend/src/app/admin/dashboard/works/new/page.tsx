"use client";
import React, { useEffect, useRef, useState } from "react";
import { encode as encodeEntities } from "html-entities";
import * as api from "../../../../../lib/api";
import { useRouter } from "next/navigation";
import Spinner from "../../../../../components/Spinner";
import { toast } from "react-toastify";

export default function NewWorkPage() {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    description: "",
    tech: "",
    year: "",
    url: "",
    repo: "",
    published: false,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
          selector: "#new-work-desc",
          menubar: false,
          plugins: ["link", "lists", "code", "autoresize"],
          toolbar:
            "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link | code",
          setup(editor: any) {
            editorRef.current = editor;
            const handler = () => {
              const content = editor.getContent();
              setForm((f) => ({ ...f, description: content }));
            };
            editor.on("Change", handler);
            editor.on("KeyUp", handler);
          },
          init_instance_callback(editor: any) {
            // ensure editor shows current description
            try {
              editor.setContent(form.description || "");
            } catch {}
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
    // ensure we capture current editor content (prevent missing description)
    const currentDescription =
      editorRef.current && typeof editorRef.current.getContent === "function"
        ? editorRef.current.getContent()
        : form.description;

    // basic client-side validation
    if (!form.title || !form.title.trim()) {
      toast.error("Title is required");
      setLoading(false);
      return;
    }
    // normalize slug to meet backend validator expectations
    const titlePartForSlug =
      form.slug && form.slug.trim() ? form.slug : form.title;
    const normalizedSlug = slugifyTitle(titlePartForSlug || "");
    const finalSlug =
      normalizedSlug || new Date().toISOString().slice(0, 10).replace(/-/g, "");
    // update form with normalized slug
    setForm((f) => ({ ...f, slug: finalSlug }));
    if (!currentDescription || !currentDescription.trim()) {
      toast.error("Description is required");
      setLoading(false);
      return;
    }
    const payload: any = {
      slug: finalSlug,
      title: form.title,
      description: encodeEntities(currentDescription),
      tech: form.tech
        ? form.tech
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      // backend expects `year` as a string (or null). Send a trimmed string or null.
      year:
        form.year && String(form.year).trim() ? String(form.year).trim() : null,
      url: form.url || null,
      repo: form.repo || null,
      published: form.published,
    };

    // handle images: upload up to 3 files and include returned URLs as an array
    if (selectedFiles && selectedFiles.length > 0) {
      const urls: string[] = [];
      // upload sequentially to reduce concurrency complications
      for (let i = 0; i < Math.min(3, selectedFiles.length); i++) {
        const f = selectedFiles[i];
        const upl = await api.uploadImageWithCategory(f, "works");
        if (!upl.ok) {
          toast.error(upl.error || "Image upload failed");
          setLoading(false);
          return;
        }
        const u = (upl as any).data?.url;
        if (u) urls.push(u);
      }
      payload.images = urls;
    }

    const res = await api.createWork(payload);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Save failed");
      return;
    }
    router.replace("/admin/dashboard/works");
  }

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">New Work</h1>
        {loading ? <Spinner /> : null}

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
          <textarea id="new-work-desc" className="border w-full p-2" rows={8} />
          <label className="block">
            <div className="text-sm mb-1">Upload up to 3 images (optional)</div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="text-[var(--apujo-blue)] border border-[var(--apujo-blue)] px-2 py-1 w-full"
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                const limited = files.slice(0, 3);
                setSelectedFiles(limited);
                // create previews
                const urls = limited.map((f) => URL.createObjectURL(f));
                setPreviewUrls(urls);
              }}
            />
          </label>
          {previewUrls && previewUrls.length > 0 ? (
            <div className="flex gap-2 mt-2">
              {previewUrls.map((p, idx) => (
                <img
                  key={idx}
                  src={p}
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
            </div>
          ) : null}
          <input
            value={form.tech}
            onChange={(e) => setForm({ ...form, tech: e.target.value })}
            placeholder="tech (comma separated)"
            className="border px-2 py-1 w-full"
          />
          <input
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            placeholder="year"
            className="border px-2 py-1 w-full"
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="url (optional)"
            className="border px-2 py-1 w-full"
          />
          <input
            value={form.repo}
            onChange={(e) => setForm({ ...form, repo: e.target.value })}
            placeholder="repo (optional)"
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
