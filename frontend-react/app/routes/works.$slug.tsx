import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import Spinner from "~/components/Spinner";
import { useMarkdownRenderer } from "~/components/useMarkdownRenderer";
import { API_BASE } from "~/lib/api";
import { usePageMeta } from "~/hooks/usePageMeta";

type Work = {
  id: number;
  slug: string;
  title: string;
  description?: string | null;
  year?: string | null;
  tags?: string[];
  links?: Array<{ label: string; url: string }>;
  images?: string[] | null;
};

function resolveImg(p?: string | null) {
  if (!p) return null;
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  return `${API_BASE}${p}`;
}

export default function WorkDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { render } = useMarkdownRenderer();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`${API_BASE}/api/works/${slug}`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        setWork(await res.json());
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  usePageMeta({
    title: work?.title || "",
    description: (work?.description || "").replace(/<[^>]+>/g, "").slice(0, 200),
    image: resolveImg(work?.images?.[0] || null) || undefined,
  });

  if (loading)
    return (
      <main className="flex justify-center py-24">
        <Spinner />
      </main>
    );
  if (notFound)
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">404 – Not Found</h1>
        <Link
          to="/works"
          className="mt-4 inline-block text-sm text-[var(--apujo-blue)] hover:underline"
        >
          ← Back to Works
        </Link>
      </main>
    );
  if (!work) return null;

  const images: string[] = work.images || [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="full"
            className="max-w-full max-h-full rounded-lg shadow-xl"
          />
        </div>
      )}

      <Link
        to="/works"
        className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
      >
        ← Works
      </Link>

      <article className="mt-6">
        <header className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            {work.title}
          </h1>
          {work.year && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 block">
              {work.year}
            </span>
          )}
          {Array.isArray(work.tags) && work.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {work.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-300"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </header>

        {images.length > 0 && (
          <div className="mb-8">
            <div
              className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
              onClick={() => setLightbox(resolveImg(images[imgIdx]) || null)}
            >
              <img
                src={resolveImg(images[imgIdx]) || ""}
                alt={work.title}
                className="w-full h-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => {
                  const src = resolveImg(img);
                  return (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-[var(--apujo-blue)]" : "border-transparent"}`}
                    >
                      <img
                        src={src || ""}
                        alt={`img ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div
          className="prose prose-zinc dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: render(work.description || ""),
          }}
        />

        {Array.isArray(work.links) && work.links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {work.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-[var(--apujo-blue)] text-white px-4 py-2 text-sm font-medium hover:bg-[#002f6f]"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
