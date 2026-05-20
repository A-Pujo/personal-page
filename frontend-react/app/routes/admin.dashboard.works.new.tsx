import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { createWork, uploadImageWithCategory, API_BASE } from "~/lib/api";
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

export default function NewWork() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [year, setYear] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const res = await uploadImageWithCategory(file, "works");
      if (res.ok) urls.push(res.data.url);
      else toast.error(`Failed to upload ${file.name}`);
    }
    setImages((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) {
      toast.error("Title is required.");
      return;
    }
    setSaving(true);
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await createWork({
      title,
      slug,
      year,
      description,
      tags: tagList,
      images,
      published,
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Work created!");
      navigate("/admin/dashboard/works");
    } else
      toast.error(
        typeof res.error === "string" ? res.error : "Failed to create.",
      );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/admin/dashboard/works"
          className="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          ← Works
        </Link>
        <h1 className="text-2xl font-bold">New Work</h1>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--apujo-blue)] focus:border-transparent transition"
            />
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
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm"
          />
          {uploading && (
            <p className="text-xs text-zinc-400 mt-1">Uploading…</p>
          )}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {images.map((url) => (
                <div key={url} className="relative group">
                  <img
                    src={url.startsWith("http") ? url : `${API_BASE}${url}`}
                    alt=""
                    className="w-20 h-20 object-cover rounded-md border border-slate-100 dark:border-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs hidden group-hover:flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <MarkdownKatexEditor value={description} onChange={setDescription} />
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
            to="/admin/dashboard/works"
            className="rounded-md border border-slate-200 dark:border-slate-700 px-5 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
