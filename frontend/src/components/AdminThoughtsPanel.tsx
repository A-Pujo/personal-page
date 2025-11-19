"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import * as api from "../lib/api";
import Toast from "./Toast";
import Spinner from "./Spinner";

export default function AdminThoughtsPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; kind?: string } | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    published: false,
  });
  const editorRef = useRef<any>(null);
  const editorId = useMemo(
    () => `tinymce-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  async function load() {
    setLoading(true);
    const res = await api.listThoughts(page * pageSize, pageSize);
    if (res.ok) setItems((res as any).data);
    else setToast({ msg: res.error || "Failed to load", kind: "error" });
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
    if (!res.ok) setToast({ msg: res.error || "Delete failed", kind: "error" });
    else {
      setToast({ msg: "Deleted", kind: "success" });
      load();
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({
      slug: "",
      title: "",
      excerpt: "",
      content: "",
      tags: "",
      published: false,
    });
    setShowForm(true);
  }

  function openEdit(t: any) {
    setEditing(t.slug);
    setForm({
      slug: t.slug,
      title: t.title,
      excerpt: t.excerpt || "",
      content: t.content || "",
      tags: (t.tags || []).join(","),
      published: !!t.published,
    });
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
      published: form.published,
    };
    let res;
    if (editing) {
      res = await api.updateThought(editing, payload);
    } else {
      res = await api.createThought(payload);
    }

    if (!res.ok) {
      setToast({ msg: res.error || "Save failed", kind: "error" });
    } else {
      setToast({ msg: editing ? "Updated" : "Created", kind: "success" });
      setShowForm(false);
      load();
    }
  }

  return (
    <div>
      {loading ? <Spinner /> : null}
      {toast ? <Toast message={toast.msg} kind={toast.kind as any} /> : null}
      <div className="space-y-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div />
          <div>
            <button
              onClick={openCreate}
              className="px-3 py-2 bg-[var(--apujo-blue)] text-xs text-white rounded"
            >
              New Thought
            </button>
          </div>
        </div>
        {showForm ? (
          <form onSubmit={submitForm} className="p-4 border rounded mb-4">
            <div className="grid grid-cols-1 gap-2">
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="slug (lowercase-dash)"
                className="border px-2 py-1"
              />
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="title"
                className="border px-2 py-1"
              />
              <input
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="excerpt"
                className="border px-2 py-1"
              />
              {/* TinyMCE textarea: id used to init editor when form shown */}
              <textarea
                id={editorId}
                defaultValue={form.content}
                placeholder="content (HTML allowed)"
                className="border px-2 py-1"
                rows={6}
              />
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="tags (comma separated)"
                className="border px-2 py-1"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                />{" "}
                Published
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-2 bg-green-600 text-white rounded"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 border rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : null}
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
              <a
                className="text-blue-600"
                href={`/thoughts/${t.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                View
              </a>
              <button onClick={() => openEdit(t)} className="text-yellow-600">
                Edit
              </button>
              <button onClick={() => remove(t.slug)} className="text-red-600">
                Delete
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
