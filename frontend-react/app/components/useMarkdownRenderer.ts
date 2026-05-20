import { useEffect, useState } from "react";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

/**
 * Loads marked + KaTeX from CDN once (idempotent) and returns a
 * `render(markdown)` function that parses Markdown with math support.
 */
export function useMarkdownRenderer() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as any;
    if (w.marked && w.markedKatex) {
      setReady(true);
      return;
    }

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css";
    document.head.appendChild(css);

    Promise.all([
      loadScript("https://cdn.jsdelivr.net/npm/marked/marked.min.js"),
      loadScript("https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"),
    ])
      .then(() =>
        loadScript(
          "https://cdn.jsdelivr.net/npm/marked-katex-extension@5.1.8/lib/index.umd.min.js",
        ),
      )
      .then(() => {
        if (w.marked && w.markedKatex) {
          w.marked.use(
            w.markedKatex({ throwOnError: false, nonStandard: true }),
          );
          w.marked.setOptions?.({ breaks: true, gfm: true });
          setReady(true);
        }
      })
      .catch(console.error);
  }, []);

  function render(markdown: string): string {
    const w = window as any;
    if (!ready || !w.marked) {
      return `<p style="color:#9ca3af;font-style:italic">Loading math renderer…</p>`;
    }
    try {
      return w.marked.parse(markdown || "");
    } catch (err: any) {
      return `<p style="color:#f87171">Parse error: ${err.message}</p>`;
    }
  }

  return { ready, render };
}
