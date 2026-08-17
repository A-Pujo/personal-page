import type { MetaDescriptor } from "react-router";

const SITE_NAME = "A-Pujo";
const SITE_URL = "https://a-pujo.my.id";

/**
 * Drops any parent-route meta entries that this route wants to replace
 * (matched by the same "title" key or the same meta name/property), then
 * appends the new tags. Route modules pass this the `matches` arg from
 * their `meta()` export so child routes can override the root's defaults
 * instead of stacking duplicate <title>/<meta> tags.
 */
export function mergeMeta(
  matches: ({ meta?: MetaDescriptor[] } | undefined)[],
  tags: MetaDescriptor[],
): MetaDescriptor[] {
  const parentMeta = matches.flatMap((m) => m?.meta ?? []);
  const overriddenKeys = new Set(
    tags.map((t) => ("name" in t ? t.name : "property" in t ? t.property : "title")),
  );
  const kept = parentMeta.filter((m) => {
    const key = "name" in m ? m.name : "property" in m ? m.property : "title" in m ? "title" : undefined;
    return key === undefined || !overriddenKeys.has(key);
  });
  return [...kept, ...tags];
}

/** Standard title + description + Open Graph/Twitter tags for a page. */
export function pageMeta(opts: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}): MetaDescriptor[] {
  const url = opts.path ? `${SITE_URL}${opts.path}` : SITE_URL;
  const title = opts.title === SITE_NAME ? SITE_NAME : `${opts.title} · ${SITE_NAME}`;
  const image = opts.image || `${SITE_URL}/img/pujo-pas-foto.jpg`;
  return [
    { title },
    { name: "description", content: opts.description },
    { property: "og:title", content: title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: opts.type || "website" },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:site_name", content: SITE_NAME },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:image", content: image },
  ];
}
