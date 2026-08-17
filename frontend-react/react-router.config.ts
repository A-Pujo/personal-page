import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode: builds a static bundle deployable on any shared hosting (Apache/Nginx)
  ssr: false,
  // NOTE: tried enabling `prerender: ["/", "/about"]` to emit static HTML for
  // the two fully-crawlable pages (helps non-JS crawlers/link-preview bots).
  // Build fails: react-router bundles the whole route graph for prerendering,
  // which pulls in react-pdf/pdfjs-dist (only used by analytics.$slug) and
  // that needs browser-only `DOMMatrix`, unavailable in Node. Revisit if
  // react-pdf's import in analytics.$slug.tsx is made a lazy/dynamic import.
} satisfies Config;
