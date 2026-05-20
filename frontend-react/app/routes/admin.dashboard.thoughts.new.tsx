import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { createThought, uploadImageWithCategory } from "~/lib/api";
import { toast } from "react-toastify";
import MarkdownKatexEditor from "~/components/MarkdownKatexEditor";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewThought() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("apujo_token"))
      navigate("/admin", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!slugEdited) {
      const s = slugify(title);
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      setSlug(s ? `${s}-${dateStr}` : "");
    }
  }, [title, slugEdited]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Title and content are required.");
      return;
    }
    setSaving(true);
    let featured_img: string | undefined;
    if (selectedFile) {
      const upl = await uploadImageWithCategory(selectedFile, "thoughts");
      if (!upl.ok) {
        toast.error("Image upload failed.");
        setSaving(false);
        return;
      }
      featured_img = upl.data.url;
    }
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await createThought({
      title,
      slug,
      excerpt,
      content,
      published,
      tags: tagList,
      ...(featured_img ? { featured_img } : {}),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Thought created!");
      navigate("/admin/dashboard/thoughts");
    } else {
      toast.error(
        typeof res.error === "string" ? res.error : "Failed to create.",
      );
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/dashboard/thoughts"
          className="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          ← Thoughts
        </Link>
        <h1 className="text-2xl font-bold">New Thought</h1>
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
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEdited(true);
            }}
            required
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--apujo-blue)] focus:border-transparent font-mono transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--apujo-blue)] focus:border-transparent resize-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Body</label>
          <MarkdownKatexEditor value={content} onChange={setContent} />
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
            Featured image (optional)
          </label>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              className="w-48 h-auto mb-2 rounded-md"
            />
          )}
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
