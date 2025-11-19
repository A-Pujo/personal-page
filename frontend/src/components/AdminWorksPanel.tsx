"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import * as api from "../lib/api";
import Toast from "./Toast";
import Spinner from "./Spinner";

export default function AdminWorksPanel() {
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
    description: "",
    year: "",
    url: "",
    repo: "",
    tech: "",
    images: "",
    published: false,
  });
  const editorRef = useRef<any>(null);
  const editorId = useMemo(
    () => `tinymce-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  async function load() {
    setLoading(true);
    const res = await api.listWorks(page * pageSize, pageSize);
    if (res.ok) setItems((res as any).data);
    else setToast({ msg: res.error || "Failed to load", kind: "error" });
    setLoading(false);
  }

  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function remove(slug: string) {
    const res = await api.deleteWork(slug);
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
      description: "",
      year: "",
      url: "",
      repo: "",
      tech: "",
      images: "",
      published: false,
    });
    setShowForm(true);
  }

  function openEdit(w: any) {
    setEditing(w.slug);
    setForm({
      slug: w.slug,
      title: w.title,
      description: w.description || "",
      year: w.year || "",
      url: w.url || "",
      repo: w.repo || "",
      tech: (w.tech || []).join(","),
      images: (w.images || []).join(","),
      published: !!w.published,
    });
    setShowForm(true);
  }

  // TinyMCE loader for description
  useEffect(() => {
    let mounted = true;
    async function ensure() {
      if (!showForm) return;
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
          selector: `#${editorId}`,
          menubar: false,
          plugins: ["link", "lists", "code", "image", "autoresize"],
          toolbar:
            "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
          setup(editor: any) {
            editorRef.current = editor;
            editor.on("Change KeyUp", () => {
              const content = editor.getContent();
              setForm((f) => ({ ...f, description: content }));
            });
          },
          init_instance_callback(editor: any) {
            editor.setContent(form.description || "");
          },
        });
      } catch (err) {}
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
      description: form.description,
      year: form.year,
      url: form.url,
      repo: form.repo,
      tech: form.tech
        ? form.tech
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      images: form.images
        ? form.images
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      published: form.published,
    };
    let res;
    if (editing) {
      res = await api.updateWork(editing, payload);
    } else {
      res = await api.createWork(payload);
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
              New Work
            </button>
          </div>
        </div>
        {showForm ? (
          <form onSubmit={submitForm} className="p-4 border rounded mb-4">
            <div className="grid grid-cols-1 gap-2">
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="slug"
                className="border px-2 py-1"
              />
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="title"
                className="border px-2 py-1"
              />
              <input
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="year"
                className="border px-2 py-1"
              />
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="url"
                className="border px-2 py-1"
              />
              <input
                value={form.repo}
                onChange={(e) => setForm({ ...form, repo: e.target.value })}
                placeholder="repo"
                className="border px-2 py-1"
              />
              <textarea
                id={editorId}
                defaultValue={form.description}
                placeholder="description"
                className="border px-2 py-1"
                rows={4}
              />
              <input
                value={form.tech}
                onChange={(e) => setForm({ ...form, tech: e.target.value })}
                placeholder="tech (comma separated)"
                className="border px-2 py-1"
              />
              <input
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                placeholder="images (comma separated URLs)"
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
        {items.map((w) => (
          <div key={w.id} className="p-4 border rounded flex justify-between">
            <div>
              <div className="font-semibold">{w.title}</div>
              <div className="text-sm text-zinc-600">{w.slug}</div>
              <div className="text-sm text-zinc-500">
                {w.year} • {w.repo || w.url}
              </div>
              <div className="text-xs text-zinc-400 mt-2">
                Tech: {(w.tech || []).join(", ")}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                className="text-blue-600"
                href={w.url || "#"}
                target="_blank"
                rel="noreferrer"
              >
                Visit
              </a>
              <button onClick={() => openEdit(w)} className="text-yellow-600">
                Edit
              </button>
              <button onClick={() => remove(w.slug)} className="text-red-600">
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
