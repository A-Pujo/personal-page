"use client";
import React, { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import Spinner from "@/components/Spinner";
import { toast } from "react-toastify";
import { encode, decode } from "html-entities";

export default function EditWorkPage(props: any) {
  const router = useRouter();
  const { slug } = use(props.params) as { slug: string };
  const editorRef = useRef<any>(null);
  const formRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    slug: "",
    title: "",
    description: "",
    tech: "",
    images: [],
    repo: "",
    url: "",
    year: "",
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
        description: decode(w.description || ""),
        tech: (w.tech || []).join(", "),
        repo: w.repo || "",
        url: w.url || "",
        year: w.year || "",
        images: w.images || [],
        published: !!w.published,
      });
      setLoading(false);
      console.log(res);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

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
          selector: "#edit-work-content",
          menubar: false,
          plugins: ["link", "lists", "code", "image", "autoresize"],
          toolbar:
            "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
          setup(editor: any) {
            editorRef.current = editor;
            const handler = () => {
              const content = editor.getContent();
              setForm((f: any) => ({ ...f, description: content }));
            };
            editor.on("Change", handler);
            editor.on("KeyUp", handler);
          },
          init_instance_callback(editor: any) {
            const initial = formRef.current?.description || "";
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
          if (current !== (form.description || "")) {
            editorRef.current.setContent(form.description || "");
          }
        } catch {
          editorRef.current.setContent(form.description || "");
        }
      }
    } catch {}
    // only re-run when the description changes
  }, [form.description]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: any = {
      slug: form.slug,
      title: form.title,
      description: encode(form.description),
      tech: form.tech
        ? form.tech
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      repo: form.repo,
      url: form.url,
      year: form.year,
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
            readOnly
            placeholder="slug (lowercase-dash)"
            className="border bg-gray-200 px-2 py-1 w-full"
          />
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="title"
            className="border px-2 py-1 w-full"
          />
          <input
            value={form.repo}
            onChange={(e) => setForm({ ...form, repo: e.target.value })}
            placeholder="repository URL"
            className="border px-2 py-1 w-full"
          />
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="project URL"
            className="border px-2 py-1 w-full"
          />
          <input
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            placeholder="year"
            className="border px-2 py-1 w-full"
          />
          <div>
            <div className="text-sm mb-1">Description</div>
            <textarea
              id="edit-work-content"
              className="border w-full p-2"
              rows={6}
            />
          </div>

          <div>
            <div className="text-sm mb-1">Existing images</div>
            <div className="flex gap-2 flex-wrap">
              {(form.images || []).map((u: string, idx: number) => (
                <div key={idx} className="w-32">
                  <img
                    src={`${api.API_BASE}${u}`}
                    className="w-32 h-20 object-cover rounded"
                  />
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
            value={form.tech}
            onChange={(e) => setForm({ ...form, tech: e.target.value })}
            placeholder="tech stack (comma separated)"
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
