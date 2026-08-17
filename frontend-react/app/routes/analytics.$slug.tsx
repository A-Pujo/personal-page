import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router";
import Spinner from "~/components/Spinner";
import { getAnalytic, API_BASE, apiUrl } from "~/lib/api";
import { usePageMeta } from "~/hooks/usePageMeta";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "react-ipynb-renderer/dist/styles/gruvboxl.css";
import "react-ipynb-renderer/dist/styles/gruvboxd.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const IpynbRenderer = lazy(() =>
  import("react-ipynb-renderer").then((m) => ({ default: m.IpynbRenderer })),
);

// ── PDF sub-component ──────────────────────────────────────────────────────
function PDFViewer({ fileUrl }: { fileUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfWidth, setPdfWidth] = useState<number>(800);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      setPdfWidth(entry.contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages: n }) => {
          setNumPages(n);
          setPageNumber(1);
        }}
      >
        <Page pageNumber={pageNumber} width={pdfWidth} className="max-w-full" />
      </Document>
      {numPages && (
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 disabled:opacity-40 transition-opacity"
          >
            ←
          </button>
          <span className="text-sm text-black dark:text-zinc-50">
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages!, p + 1))}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 disabled:opacity-40 transition-opacity"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AnalyticDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [notebookJson, setNotebookJson] = useState<any | null>(null);
  const [notebookError, setNotebookError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
    const obs = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!slug) return;
    getAnalytic(slug).then((res) => {
      if (res.ok) setItem((res as any).data);
      setLoading(false);
    });
  }, [slug]);

  const fileUrl = item
    ? (item.file_url || item.file_path || "").startsWith("/static") ||
      (item.file_url || item.file_path || "").startsWith("/uploads")
      ? apiUrl(item.file_url || item.file_path || "")
      : item.file_url || item.file_path || ""
    : "";

  useEffect(() => {
    if (!item || !fileUrl) return;
    if (
      !(
        item.file_type === "application/json" ||
        (item.file_url || item.file_path || "").endsWith(".ipynb")
      )
    )
      return;

    let mounted = true;
    async function loadNotebook() {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) {
          setNotebookError(
            `Failed to fetch notebook: ${res.status} ${res.statusText}`,
          );
          return;
        }
        const json = await res.json();
        if (!mounted) return;
        if (!json?.cells) {
          setNotebookError("Notebook JSON missing cells");
          setNotebookJson(json);
          return;
        }
        setNotebookJson(json);
      } catch (e) {
        if (mounted) setNotebookError(String(e));
      }
    }
    loadNotebook();
    return () => {
      mounted = false;
    };
  }, [item, fileUrl]);

  usePageMeta({
    title: item?.title || "",
    description: (item?.excerpt || "").slice(0, 200),
  });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );

  if (!item)
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-8 py-6 text-center">
          <p className="text-lg font-semibold text-red-700 dark:text-red-400">
            Not found
          </p>
          <p className="text-sm text-red-600 dark:text-red-500 mt-1">
            This analytic item could not be found.
          </p>
          <Link
            to="/analytics"
            className="mt-4 inline-block text-sm text-[var(--apujo-blue)] hover:underline"
          >
            ← Back to Analytics
          </Link>
        </div>
      </div>
    );

  const BackLink = () => (
    <Link to="/analytics" className="text-sm text-zinc-500 hover:underline">
      ← Analytics
    </Link>
  );

  const DownloadLink = () => (
    <a
      href={fileUrl}
      download
      className={`inline-flex items-center gap-1 shrink-0 text-sm hover:underline ${
        isDark ? "text-sky-300" : "text-[var(--apujo-blue)]"
      }`}
    >
      Download ↓
    </a>
  );

  const PageHeader = () => (
    <div className="flex items-start justify-between gap-4 mt-4">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          {item.title}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          {item.excerpt}
        </p>
      </div>
      <DownloadLink />
    </div>
  );

  // ── PDF ──
  if (item.file_type === "application/pdf") {
    return (
      <div className="min-h-screen px-6 py-20">
        <main className="mx-auto max-w-4xl space-y-6">
          <BackLink />
          <PageHeader />
          <PDFViewer fileUrl={fileUrl} />
        </main>
      </div>
    );
  }

  // ── HTML ──
  if (
    item.file_type === "text/html" ||
    (item.file_url || item.file_path || "").endsWith(".html")
  ) {
    return (
      <div className="min-h-screen px-6 py-20">
        <main className="mx-auto max-w-6xl space-y-6">
          <BackLink />
          <PageHeader />
          <div
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            style={{ height: "80vh" }}
          >
            <iframe
              src={fileUrl}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full"
              title={item.title}
            />
          </div>
        </main>
      </div>
    );
  }

  // ── Notebook ──
  if (
    item.file_type === "application/json" ||
    (item.file_url || item.file_path || "").endsWith(".ipynb")
  ) {
    return (
      <div className="min-h-screen px-6 py-20">
        <main className="mx-auto max-w-4xl space-y-6">
          <BackLink />
          <PageHeader />
          <div className="mt-2">
            {notebookError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {notebookError}
              </div>
            ) : notebookJson?.cells ? (
              <Suspense fallback={<Spinner />}>
                <div className={isDark ? "text-slate-100" : "text-slate-900"}>
                  <IpynbRenderer
                    ipynb={notebookJson}
                    syntaxTheme={isDark ? "atomDark" : "duotoneSpace"}
                  />
                </div>
              </Suspense>
            ) : (
              <div className="flex items-center gap-2 text-sm text-zinc-500 py-8 justify-center">
                <Spinner /> <span>Loading notebook…</span>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ── Fallback ──
  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-4xl space-y-6">
        <BackLink />
        <PageHeader />
      </main>
    </div>
  );
}
