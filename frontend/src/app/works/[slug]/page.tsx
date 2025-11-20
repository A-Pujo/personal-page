"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { decode } from "html-entities";
import Spinner from "../../../components/Spinner";
import { toast } from "react-toastify";

type Work = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  images?: string[] | null;
  year?: string | null;
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
    const uls = Array.from(doc.querySelectorAll("ul"));
    uls.forEach((ul) => {
      if (!ul.classList.contains("list-disc")) ul.classList.add("list-disc");
      if (!ul.classList.contains("pl-6")) ul.classList.add("pl-6");
    });
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

export default function WorkDetailPage() {
  const { slug } = useParams();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363";
    fetch(`${base}/api/works/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setWork(data))
      .catch(() => {
        setWork(null);
        toast.error("Work not found");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading)
    return (
      <div className="p-6">
        <Spinner />
      </div>
    );
  if (!work) return <div className="p-6">Work not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{work.title}</h1>
      {work.year && (
        <div className="text-sm text-zinc-500 mt-1">{work.year}</div>
      )}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(work.images || []).map((img, idx) => {
          const src = resolveImg(img || null);
          return src ? (
            <img
              key={idx}
              src={src}
              className="w-full h-48 object-cover rounded"
            />
          ) : null;
        })}
      </div>
      <div
        className="prose mt-6"
        dangerouslySetInnerHTML={{
          __html: normalizeLists(decodeEntities(work.description || "")),
        }}
      />
    </div>
  );
}
