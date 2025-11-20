"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { decode } from "html-entities";
import Link from "next/link";
import * as api from "../lib/api";
import Spinner from "./Spinner";
import { toast } from "react-toastify";
import { Eye, PencilIcon, Trash } from "lucide-react";

export default function AdminThoughtsPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    featured_img: "",
    published: false,
  });
  const editorRef = useRef<any>(null);
  const editorId = useMemo(
    () => `tinymce-${Math.random().toString(36).slice(2, 8)}`,
    []
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const resolveImg = (p?: string | null) => {
    if (!p) return null;
    if (p.startsWith("http") || p.startsWith("data:")) return p;
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363";
    return `${base}${p}`;
  };

  function decodeEntities(s: string) {
    try {
      let out = decode(s || "");
      if (
        out.includes("&lt;") ||
        out.includes("&gt;") ||
        out.includes("&amp;")
      ) {
        out = decode(out);
      }
      return out;
    } catch {
      return s;
    }
  }

  async function load() {
    setLoading(true);
    const res = await api.listThoughts(page * pageSize, pageSize);
    if (res.ok) setItems((res as any).data);
    else toast.error(res.error || "Failed to load");
    setLoading(false);
  }

  // pagination
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    load();
  }, []);

  // reload when page changes
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function remove(slug: string) {
    const res = await api.deleteThought(slug);
    if (!res.ok) toast.error(res.error || "Delete failed");
    else {
      toast.success("Deleted");
      load();
    }
  }

  function openEdit(t: any) {
    setEditing(t.slug);
    setForm({
      slug: t.slug,
      title: t.title,
      excerpt: t.excerpt || "",
      content: decodeEntities(t.content || ""),
      tags: (t.tags || []).join(","),
      featured_img: t.featured_img || "",
      published: !!t.published,
    });
    setPreviewUrl(resolveImg(t.featured_img || null));
    setSelectedFile(null);
    setShowForm(true);
  }

  // TinyMCE loader when form shown
  useEffect(() => {
    let mounted = true;
    async function ensure() {
      if (!showForm) return;
      // load script if not present
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
      // init editor on textarea id
      try {
        tm.init({
          license_key: "gpl",
          selector: `#${editorId}`,
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
            // set initial content
            editor.setContent(form.content || "");
          },
        });
      } catch (err) {
        // fallback: do nothing
      }
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
  }, [showForm, editorId]);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
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
    let res;
    // If user selected a new image file, upload it first
    if (selectedFile) {
      const upl = await api.uploadImage(selectedFile);
      if (!upl.ok) {
        toast.error(upl.error || "Image upload failed");
        return;
      }
      payload.featured_img = (upl as any).data?.url || null;
    }
    if (editing) {
      res = await api.updateThought(editing, payload);
    } else {
      res = await api.createThought(payload);
    }

    if (!res.ok) {
      toast.error(res.error || "Save failed");
    } else {
      toast.success(editing ? "Updated" : "Created");
      setShowForm(false);
      load();
    }
  }

  return (
    <div>
      {loading ? <Spinner /> : null}
      <div className="space-y-4 mt-4">
        {items.map((t) => (
          <div key={t.id} className="p-4 border rounded flex justify-between">
            <div>
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-zinc-600">{t.slug}</div>
              <div className="text-sm text-zinc-500">{t.excerpt}</div>
              <div className="text-xs text-zinc-400 mt-2">
                Tags: {(t.tags || []).join(", ")} •{" "}
                {t.published ? "published" : "draft"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const src = resolveImg(t.featured_img || null);
                return src ? (
                  <img
                    src={src}
                    alt="thumb"
                    className="w-20 h-14 object-cover rounded"
                  />
                ) : null;
              })()}
              <Link
                className="text-white bg-blue-600 px-2 py-1 rounded"
                href={`/thoughts/${t.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                <Eye />
              </Link>
              <Link
                href={`/admin/dashboard/thoughts/${t.slug}`}
                className="text-white bg-yellow-600 px-2 py-1 rounded"
              >
                <PencilIcon />
              </Link>
              <button onClick={() => remove(t.slug)} className="text-red-600">
                <Trash />
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
  );
}
