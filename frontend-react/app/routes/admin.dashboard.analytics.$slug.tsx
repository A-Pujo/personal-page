import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { getAnalytic, updateAnalytic, API_BASE } from "~/lib/api";
import { toast } from "react-toastify";
import Spinner from "~/components/Spinner";

export default function EditAnalytic() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    tags: "",
    published: false,
    existingFileUrl: "",
  });

  useEffect(() => {
    if (!localStorage.getItem("apujo_token"))
      navigate("/admin", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!slug) return;
    getAnalytic(slug).then((res) => {
      if (res.ok) {
        const it = res.data as any;
        setForm({
          title: it.title || "",
          slug: it.slug || "",
          excerpt: it.excerpt || "",
          tags: Array.isArray(it.tags) ? it.tags.join(", ") : it.tags || "",
          published: !!it.published,
          existingFileUrl: it.file_url || it.file_path || "",
        });
      } else {
        toast.error("Could not load analytic.");
      }
      setLoading(false);
    });
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setSaving(true);
    const fd = new FormData();
    if (form.title) fd.append("title", form.title);
    if (form.slug && form.slug !== slug) fd.append("new_slug", form.slug);
    if (form.excerpt) fd.append("excerpt", form.excerpt);
    if (form.tags) fd.append("tags", form.tags);
    fd.append("published", form.published ? "1" : "0");
    const file = fileRef.current?.files?.[0];
    if (file) fd.append("file", file);
    const res = await updateAnalytic(slug, fd);
    setSaving(false);
    if (res.ok) {
      toast.success("Saved!");
      navigate("/admin/dashboard/analytics");
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
          to="/admin/dashboard/analytics"
          className="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          ← Analytics
        </Link>
        <h1 className="text-2xl font-bold">Edit Analytic</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={form.slug}
            readOnly
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-sm font-mono focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--apujo-blue)] focus:border-transparent transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea
            value={form.excerpt}
            onChange={(e) =>
              setForm((f) => ({ ...f, excerpt: e.target.value }))
            }
            rows={4}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--apujo-blue)] focus:border-transparent resize-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--apujo-blue)] focus:border-transparent transition"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) =>
              setForm((f) => ({ ...f, published: e.target.checked }))
            }
          />
          Published
        </label>

        {form.existingFileUrl && (
          <div>
            <span className="block text-sm font-medium mb-1">
              Current file:
            </span>
            <a
              href={`${API_BASE}${form.existingFileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[var(--apujo-blue)] hover:underline"
            >
              View current file
            </a>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Replace File (optional)
          </label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.ipynb,.html,application/pdf,application/json,text/html"
            className="text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[var(--apujo-blue)] text-white px-5 py-2 text-sm font-medium hover:bg-[#002f6f] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <Link
            to="/admin/dashboard/analytics"
            className="rounded-md border border-slate-200 dark:border-slate-700 px-5 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
