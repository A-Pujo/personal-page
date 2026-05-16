import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  getThought,
  updateThought,
  uploadImageWithCategory,
  API_BASE,
} from "~/lib/api";
import { decode } from "html-entities";
import { toast } from "react-toastify";
import Spinner from "~/components/Spinner";

declare global {
  interface Window {
    tinymce: any;
  }
}

type Thought = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published: boolean;
  featured_img?: string;
  tags?: string[];
};

function resolveImg(p?: string | null) {
  if (!p) return null;
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  return `${API_BASE}${p}`;
}

export default function EditThought() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<any>(null);
  const formRef = useRef<any>(null);
  const [thought, setThought] = useState<Thought | null>(null);
  const [title, setTitle] = useState("");
  const [excerptVal, setExcerptVal] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [featuredImg, setFeaturedImg] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const editorId = `tinymce-edit-thought-${slug}`;

  useEffect(() => {
    if (!localStorage.getItem("apujo_token"))
      navigate("/admin", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!slug) return;
    getThought(slug).then((res) => {
      if (res.ok) {
        const d = res.data as Thought;
        const decoded = { ...d, content: decode(d.content || "") };
        setThought(decoded);
        setTitle(d.title);
        setExcerptVal(d.excerpt || "");
        setPublished(!!d.published);
        setTags((d.tags || []).join(", "));
        setFeaturedImg(d.featured_img || "");
      } else {
        toast.error("Could not load thought.");
      }
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    formRef.current = { content: thought?.content || "" };
  }, [thought]);

  useEffect(() => {
    if (!thought) return;
    let mounted = true;
    async function ensure() {
      if (typeof window.tinymce === "undefined") {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "/js/tinymce/tinymce.min.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("Failed to load tinymce"));
          document.head.appendChild(s);
        });
      }
      if (!mounted) return;
      window.tinymce.init({
        license_key: "gpl",
        selector: `#${editorId}`,
        menubar: false,
        plugins: ["link", "lists", "code", "image", "autoresize"],
        toolbar:
          "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code",
        images_upload_handler: async (
          blobInfo: any,
          success: any,
          failure: any,
        ) => {
          const res = await uploadImageWithCategory(
            blobInfo.blob() as File,
            "thoughts",
          );
          if (res.ok) success(res.data.url);
          else failure("Upload failed");
        },
        setup(editor: any) {
          editorRef.current = editor;
        },
        init_instance_callback(editor: any) {
          editor.setContent(formRef.current?.content || "");
        },
      });
    }
    ensure();
    return () => {
      mounted = false;
      try {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      } catch {}
    };
  }, [thought]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    const content =
      editorRef.current?.getContent?.() ??
      window.tinymce?.get(editorId)?.getContent() ??
      "";
    if (!title || !content) {
      toast.error("Title and content are required.");
      return;
    }
    setSaving(true);
    let newFeaturedImg: string | undefined;
    if (selectedFile) {
      const upl = await uploadImageWithCategory(selectedFile, "thoughts");
      if (!upl.ok) {
        toast.error("Image upload failed.");
        setSaving(false);
        return;
      }
      newFeaturedImg = upl.data.url;
    }
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await updateThought(slug, {
      title,
      excerpt: excerptVal,
      content,
      published,
      tags: tagList,
      ...(newFeaturedImg ? { featured_img: newFeaturedImg } : {}),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Saved!");
      navigate("/admin/dashboard/thoughts");
    } else {
      toast.error(
        typeof res.error === "string" ? res.error : "Failed to save.",
      );
    }
  }

  if (loading)
    return (
      <main className="flex justify-center py-24">
        <Spinner />
      </main>
    );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/dashboard/thoughts"
          className="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          ← Thoughts
        </Link>
        <h1 className="text-2xl font-bold">Edit Thought</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--apujo-blue)] focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            readOnly
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-sm font-mono focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea
            value={excerptVal}
            onChange={(e) => setExcerptVal(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--apujo-blue)] focus:border-transparent resize-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Body</label>
          <textarea id={editorId} defaultValue="" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--apujo-blue)] focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Featured image
          </label>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              className="w-48 h-auto mb-2 rounded-md"
            />
          ) : featuredImg ? (
            <img
              src={resolveImg(featuredImg) ?? undefined}
              alt="current"
              className="w-48 h-auto mb-2 rounded-md"
            />
          ) : null}
          <input
            type="file"
            accept="image/*"
            className="text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setSelectedFile(f);
              if (f) setPreviewUrl(URL.createObjectURL(f));
              else setPreviewUrl(null);
            }}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[var(--apujo-blue)] text-white px-5 py-2 text-sm font-medium hover:bg-[#002f6f] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <Link
            to="/admin/dashboard/thoughts"
            className="rounded-md border border-slate-200 dark:border-slate-700 px-5 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
