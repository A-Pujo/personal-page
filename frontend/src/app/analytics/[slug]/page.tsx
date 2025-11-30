"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { getAnalytic, API_BASE } from "../../../lib/api";
const IpynbRenderer = dynamic(
  () => import("react-ipynb-renderer").then((mod) => mod.IpynbRenderer),
  {
    ssr: false,
  }
);
import "react-ipynb-renderer/dist/styles/gruvboxd.css";
import { JupyterReactTheme, Notebook } from "@datalayer/jupyter-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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

  // PDF rendering state
  const [PDFFile, setPDFFile] = React.useState<any | null>(null);
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [pageNumber, setPageNumber] = React.useState<number>(1);

  const [notebookJson, setNotebookJson] = React.useState<any | null>(null);
  const [notebookError, setNotebookError] = React.useState<string | null>(null);

  // responsive PDF width
  const pdfContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [pdfWidth, setPdfWidth] = React.useState<number | null>(null);

  useEffect(() => {
    function updateWidth() {
      const w = pdfContainerRef.current?.clientWidth || null;
      setPdfWidth(w);
    }
    console.log("PDF width:", pdfWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [item]);

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

  // Dynamically load react-pdf when needed
  useEffect(() => {
    // only run after we have an item and fileUrl
    if (!item || !fileUrl) return;
    if (item.file_type !== "application/pdf") return;

    console.log(item);

    let mounted = true;
    setPDFFile(fileUrl);
    return () => {
      mounted = false;
    };
  }, [item, fileUrl]);

  // Dynamically load react-ipynb-renderer and fetch notebook JSON when needed
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
            `Failed to fetch notebook: ${res.status} ${res.statusText}`
          );
          return;
        }
        const json = await res.json();
        if (!mounted) return;
        if (!json || typeof json !== "object") {
          setNotebookError("Notebook payload is invalid");
          return;
        }
        if (!json.cells) {
          setNotebookError("Notebook JSON missing cells");
          // still set the json so developer can inspect if needed
          setNotebookJson(json);
          return;
        }
        setNotebookJson(json);
      } catch (e) {
        console.warn("Failed to load notebook", e);
        if (mounted) setNotebookError(String(e));
      }
    }

    loadNotebook();
    return () => {
      mounted = false;
    };
  }, [item, fileUrl]);

  // helper for react-pdf
  function onDocumentLoadSuccess({ numPages: np }: { numPages: number }) {
    setNumPages(np);
    setPageNumber(1);
  }

  if (loading) return <div className="min-h-screen px-6 py-20">Loading...</div>;
  if (!item) return <div className="min-h-screen px-6 py-20">Not found</div>;

  // Render based on file_type
  if (item.file_type === "application/pdf") {
    return (
      <div className="min-h-screen px-6 py-20">
        <main className="mx-auto max-w-4xl space-y-8">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <p className="text-sm text-zinc-600">{item.excerpt}</p>

          {PDFFile && pdfWidth ? (
            <div ref={pdfContainerRef} className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <Document file={PDFFile} onLoadSuccess={onDocumentLoadSuccess}>
                  <Page
                    pageNumber={pageNumber}
                    width={pdfWidth ?? undefined}
                    className="max-w-full"
                  />
                </Document>
              </div>
            </div>
          ) : (
            <iframe src={fileUrl} className="w-full h-screen mt-4" />
          )}
        </main>
      </div>
    );
  }

  if (
    item.file_type === "application/json" ||
    item.file_url.endsWith(".ipynb")
  ) {
    // Render the notebook using react-ipynb-renderer when available
    return (
      <div className="min-h-screen px-6 py-20">
        <main className="mx-auto max-w-4xl space-y-8">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          <p className="text-sm text-zinc-600">{item.excerpt}</p>
          <div className="mt-4">
            {notebookError ? (
              <div className="text-sm text-red-600">{notebookError}</div>
            ) : notebookJson && notebookJson.cells ? (
              <IpynbRenderer ipynb={notebookJson} />
            ) : (
              <div>Loading notebook...</div>
            )}
            {/* {item.file_url.endsWith(".ipynb") ? (
              <JupyterReactTheme>
                <Notebook path={fileUrl} id="notebook-id" startDefaultKernel />
              </JupyterReactTheme>
            ) : null} */}
          </div>
        </main>
      </div>
    );
  }

  // fallback: offer link
  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold">{item.title}</h1>
        <p className="text-sm text-zinc-600">{item.excerpt}</p>
        <a
          className="text-sm text-[var(--apujo-blue)]"
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
        >
          Download
        </a>
      </main>
    </div>
  );
}
