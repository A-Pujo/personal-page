"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getAnalytic, API_BASE } from "../../../lib/api";
import Spinner from "../../../components/Spinner";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "react-ipynb-renderer/dist/styles/gruvboxd.css";

const IpynbRenderer = dynamic(
  () => import("react-ipynb-renderer").then((mod) => mod.IpynbRenderer),
  { ssr: false },
);

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ── PDF sub-component ──────────────────────────────────────────────────────
function PDFViewer({ fileUrl }: { fileUrl: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);
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
          <span className="text-sm">
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
export default function AnalyticSlugPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const resolvedParams = (React as any).use
    ? (React as any).use(params)
    : params;
  const slug = (resolvedParams as { slug: string }).slug;

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
    async function load() {
      const res = await getAnalytic(slug);
      if (res.ok) setItem((res as any).data);
      setLoading(false);
    }
    load();
  }, [slug]);

  const fileUrl = item
    ? item.file_url.startsWith("/static")
      ? `${API_BASE}${item.file_url}`
      : item.file_url
    : "";

  useEffect(() => {
    if (!item || !fileUrl) return;
    if (
      !(
        item.file_type === "application/json" ||
        item.file_url.endsWith(".ipynb")
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
        </div>
      </div>
    );

  const DownloadLink = () => (
    <a
      href={fileUrl}
      download
      className="inline-flex items-center gap-1 shrink-0 text-sm text-[var(--apujo-blue)] hover:underline"
    >
      Download ↓
    </a>
  );

  const PageHeader = () => (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">{item.title}</h1>
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
          <PageHeader />
          <PDFViewer fileUrl={fileUrl} />
        </main>
      </div>
    );
  }

  // ── HTML ──
  if (item.file_type === "text/html" || item.file_url.endsWith(".html")) {
    return (
      <div className="min-h-screen px-6 py-20">
        <main className="mx-auto max-w-6xl space-y-6">
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
    item.file_url.endsWith(".ipynb")
  ) {
    return (
      <div className="min-h-screen px-6 py-20">
        <main className="mx-auto max-w-4xl space-y-6">
          <PageHeader />
          <div className="mt-2">
            {notebookError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                {notebookError}
              </div>
            ) : notebookJson?.cells ? (
              <IpynbRenderer
                ipynb={notebookJson}
                syntaxTheme={isDark ? "atomDark" : "ghcolors"}
              />
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
        <PageHeader />
      </main>
    </div>
  );
}
