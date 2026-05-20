import { useEffect, useRef, useState } from "react";
import { useMarkdownRenderer } from "~/components/useMarkdownRenderer";

type ViewMode = "editor" | "split" | "preview";

interface Props {
  value: string;
  onChange: (val: string) => void;
  minHeight?: number;
}

type ToolbarItem = {
  label: string;
  title: string;
  before: string;
  after: string;
} | null;

const TOOLBAR: ToolbarItem[] = [
  { label: "B", title: "Bold", before: "**", after: "**" },
  { label: "I", title: "Italic", before: "_", after: "_" },
  { label: "~~", title: "Strikethrough", before: "~~", after: "~~" },
  null,
  { label: "H1", title: "Heading 1", before: "# ", after: "" },
  { label: "H2", title: "Heading 2", before: "## ", after: "" },
  { label: "H3", title: "Heading 3", before: "### ", after: "" },
  null,
  { label: "$…$", title: "Inline math (KaTeX)", before: "$", after: "$" },
  {
    label: "$$…$$",
    title: "Block math (KaTeX)",
    before: "\n$$\n",
    after: "\n$$\n",
  },
  null,
  { label: "`code`", title: "Inline code", before: "`", after: "`" },
  {
    label: "```block",
    title: "Code block",
    before: "\n```\n",
    after: "\n```\n",
  },
  null,
  {
    label: "---",
    title: "Horizontal rule",
    before: "\n\n---\n\n",
    after: "",
  },
  { label: "Link", title: "Hyperlink", before: "[", after: "](url)" },
];

export default function MarkdownKatexEditor({
  value,
  onChange,
  minHeight = 480,
}: Props) {
  const { render } = useMarkdownRenderer();
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollSource = useRef<string | null>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen]);

  function insertFormatting(before: string, after: string) {
    const el = textareaRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const selected = value.slice(s, e);
    onChange(value.slice(0, s) + before + selected + after + value.slice(e));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        s + before.length,
        s + before.length + selected.length,
      );
    }, 10);
  }

  function onEditorScroll(ev: React.UIEvent<HTMLTextAreaElement>) {
    if (scrollSource.current && scrollSource.current !== "editor") return;
    scrollSource.current = "editor";
    const ed = ev.currentTarget;
    const pr = previewRef.current;
    if (pr && viewMode === "split") {
      const ratio =
        ed.scrollTop / Math.max(1, ed.scrollHeight - ed.clientHeight);
      pr.scrollTop = ratio * (pr.scrollHeight - pr.clientHeight);
    }
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      scrollSource.current = null;
    }, 150);
  }

  function onPreviewScroll(ev: React.UIEvent<HTMLDivElement>) {
    if (scrollSource.current && scrollSource.current !== "preview") return;
    scrollSource.current = "preview";
    const pr = ev.currentTarget;
    const ed = textareaRef.current;
    if (ed && viewMode === "split") {
      const ratio =
        pr.scrollTop / Math.max(1, pr.scrollHeight - pr.clientHeight);
      ed.scrollTop = ratio * (ed.scrollHeight - ed.clientHeight);
    }
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      scrollSource.current = null;
    }, 150);
  }

  const showEditor = viewMode !== "preview";
  const showPreview = viewMode !== "editor";

  return (
    <div
      className={`border border-slate-200 dark:border-slate-700 overflow-hidden ${
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col rounded-none"
          : "rounded-lg"
      }`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        {TOOLBAR.map((btn, i) =>
          btn === null ? (
            <span
              key={i}
              className="inline-block w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"
            />
          ) : (
            <button
              key={btn.title}
              type="button"
              title={btn.title}
              onClick={() => insertFormatting(btn.before, btn.after)}
              className="px-2 py-1 text-xs font-mono rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-zinc-700 dark:text-zinc-300 transition"
            >
              {btn.label}
            </button>
          ),
        )}

        <span className="flex-1" />

        {/* View-mode toggle */}
        <div className="flex rounded overflow-hidden border border-slate-300 dark:border-slate-600 text-xs">
          {(["editor", "split", "preview"] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setViewMode(m)}
              className={`px-2.5 py-1 capitalize transition ${
                viewMode === m
                  ? "bg-[var(--apujo-blue)] text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Fullscreen toggle */}
        <button
          type="button"
          onClick={() => setIsFullscreen((f) => !f)}
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
          className="ml-1 p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-zinc-600 dark:text-zinc-400 transition"
        >
          {isFullscreen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8V5a2 2 0 0 1 2-2h3" />
              <path d="M16 3h3a2 2 0 0 1 2 2v3" />
              <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
              <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
            </svg>
          )}
        </button>
      </div>

      {/* Editor / Preview panes */}
      <div
        className={`flex ${isFullscreen ? "flex-1 min-h-0" : ""}`}
        style={isFullscreen ? undefined : { minHeight }}
      >
        {showEditor && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={onEditorScroll}
            spellCheck
            placeholder="Write Markdown with $inline math$ or $$block equations$$…"
            className={`resize-none p-3 text-sm font-mono leading-relaxed bg-slate-50 dark:bg-slate-900 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-inset focus:ring-[var(--apujo-blue)] ${
              showPreview
                ? "w-1/2 border-r border-slate-200 dark:border-slate-700"
                : "w-full"
            } ${isFullscreen ? "h-full" : ""}`}
            style={isFullscreen ? undefined : { minHeight }}
          />
        )}

        {showPreview && (
          <div
            ref={previewRef}
            onScroll={onPreviewScroll}
            className={`overflow-auto p-4 prose prose-sm dark:prose-invert max-w-none bg-white dark:bg-slate-900 ${
              showEditor ? "w-1/2" : "w-full"
            } ${isFullscreen ? "h-full" : ""}`}
            style={isFullscreen ? undefined : { minHeight }}
            dangerouslySetInnerHTML={{ __html: render(value) }}
          />
        )}
      </div>
    </div>
  );
}
