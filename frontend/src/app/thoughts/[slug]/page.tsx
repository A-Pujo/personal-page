"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { decode } from "html-entities";
import Spinner from "../../../components/Spinner";
import { toast } from "react-toastify";

type Thought = {
  id: number;
  title: string;
  slug: string;
  content: string;
  featured_img?: string | null;
  created_at?: string;
};

const resolveImg = (p?: string | null) => {
  if (!p) return null;
  if (p.startsWith("http") || p.startsWith("data:")) return p;
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363";
  return `${base}${p}`;
};

function decodeEntities(s: string) {
  try {
    let out = decode(s || "");
    // if content still contains encoded angle brackets or common encodings,
    // try a second decode pass (handles double-encoded HTML like &amp;lt;ul&amp;gt;)
    if (out.includes("&lt;") || out.includes("&gt;") || out.includes("&amp;")) {
      out = decode(out);
    }
    return out;
  } catch {
    return s;
  }
}

function normalizeLists(html: string) {
  if (!html) return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    // add classes to <ul>
    const uls = Array.from(doc.querySelectorAll("ul"));
    uls.forEach((ul) => {
      if (!ul.classList.contains("list-disc")) ul.classList.add("list-disc");
      if (!ul.classList.contains("pl-6")) ul.classList.add("pl-6");
    });
    // add classes to <ol>
    const ols = Array.from(doc.querySelectorAll("ol"));
    ols.forEach((ol) => {
      if (!ol.classList.contains("list-decimal"))
        ol.classList.add("list-decimal");
      if (!ol.classList.contains("pl-6")) ol.classList.add("pl-6");
    });
    return doc.body.innerHTML;
  } catch (e) {
    return html;
  }
}

export default function ThoughtDetailPage() {
  const { slug } = useParams();
  const [thought, setThought] = useState<Thought | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363";
    fetch(`${base}/api/thoughts/${slug}`)
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
  if (!thought) return <div className="p-6">Thought not found</div>;

  const img = resolveImg(thought.featured_img || null);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{thought.title}</h1>
      {img && (
        <img
          src={img}
          alt={thought.title}
          className="mt-4 w-full object-cover rounded"
        />
      )}
      <div
        className="prose mt-6"
        dangerouslySetInnerHTML={{
          __html: normalizeLists(decodeEntities(thought?.content || "")),
        }}
      />
    </div>
  );
}
