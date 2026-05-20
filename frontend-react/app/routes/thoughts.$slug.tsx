import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { decode } from "html-entities";
import { API_BASE } from "~/lib/api";
import Spinner from "~/components/Spinner";
import { useMarkdownRenderer } from "~/components/useMarkdownRenderer";

type Thought = {
  id: number;
  title: string;
  slug: string;
  content: string;
  featured_img?: string | null;
  created_at?: string;
};

function resolveImg(p?: string | null) {
  if (!p) return null;
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  return `${API_BASE}${p}`;
}

function decodeContent(s: string) {
  try {
    let out = decode(s || "");
    // Handle doubly-encoded entities from legacy TinyMCE posts
    if (out.includes("&lt;") || out.includes("&gt;") || out.includes("&amp;")) {
      out = decode(out);
    }
    return out;
  } catch {
    return s || "";
  }
}

export default function ThoughtDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { render } = useMarkdownRenderer();
  const [thought, setThought] = useState<Thought | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API_BASE}/api/thoughts/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setThought(data))
      .catch(() => setThought(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <div className="p-6">
        <Spinner />
      </div>
    );
  if (!thought)
    return (
      <div className="p-6">
        Thought not found.{" "}
        <Link
          to="/thoughts"
          className="text-[var(--apujo-blue)] hover:underline"
        >
          ← Back
        </Link>
      </div>
    );

  const img = resolveImg(thought.featured_img || null);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to="/thoughts" className="text-sm text-zinc-500 hover:underline">
        ← Thoughts
      </Link>
      <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mt-4">
        {thought.title}
      </h1>
      {img && (
        <img
          src={img}
          alt={thought.title}
          className="mt-4 w-full object-cover rounded"
        />
      )}
      <div
        className="prose mt-6 dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: render(decodeContent(thought.content || "")),
        }}
      />
    </div>
  );
}
