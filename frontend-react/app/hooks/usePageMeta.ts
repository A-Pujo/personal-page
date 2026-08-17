import { useEffect } from "react";

const SITE_NAME = "A-Pujo";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Sets the document title and description/Open Graph tags once dynamic
 * data (a thought, work, or analytic item) has loaded client-side. These
 * routes fetch in a `useEffect` rather than a route loader, so `meta()`
 * export has no data to work with — this fills the same gap imperatively.
 * Skipped while `title` is empty (i.e. before the fetch resolves).
 */
export function usePageMeta(opts: {
  title: string;
  description?: string;
  image?: string;
}) {
  useEffect(() => {
    if (!opts.title) return;
    const fullTitle = `${opts.title} · ${SITE_NAME}`;
    document.title = fullTitle;
    const description = opts.description || "";
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "article");
    if (opts.image) upsertMeta("property", "og:image", opts.image);
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
  }, [opts.title, opts.description, opts.image]);
}
