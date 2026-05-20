import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { decode } from "html-entities";
import {
  getWork,
  updateWork,
  uploadImageWithCategory,
  API_BASE,
} from "~/lib/api";
import { toast } from "react-toastify";
import Spinner from "~/components/Spinner";
import MarkdownKatexEditor from "~/components/MarkdownKatexEditor";

type Work = {
  id: number;
  slug: string;
  title: string;
  description: string;
  year?: string;
  tags?: string[];
  images: Array<{ image_path: string } | string>;
  published?: boolean;
};

export default function EditWork() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [work, setWork] = useState<Work | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("apujo_token"))
      navigate("/admin", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!slug) return;
    getWork(slug).then((res) => {
      if (res.ok) {
        const d = res.data as Work;
        setWork(d);
        setTitle(d.title);
        setDescription(decode(d.description || ""));
        setYear(d.year || "");
        setTags((d.tags || []).join(", "));
        const imgs = (d.images || []).map((img) =>
          typeof img === "string" ? img : img.image_path,
        );
        setImages(imgs);
        setPublished(!!d.published);
      } else {
        toast.error("Could not load work.");
      }
      setLoading(false);
    });
  }, [slug]);

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
    if (!slug) return;
    if (!title) {
      toast.error("Title is required.");
      return;
    }
    setSaving(true);
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const res = await updateWork(slug, {
      title,
      year,
      description,
      tags: tagList,
      images,
      published,
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Work updated!");
      navigate("/admin/dashboard/works");
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
          to="/admin/dashboard/works"
          className="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          ← Works
        </Link>
        <h1 className="text-2xl font-bold">Edit Work</h1>
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
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
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
