This enhancement is done and published as per 2026-05-15

---

# UI & Analytics Enhancement Proposal

> **Status:** Draft — review before implementation  
> **Scope:** All public-facing pages + Analytics detail renderer  
> **Stack:** Next.js 16 / React 19 / Tailwind CSS v4 / existing packages

---

## 1. Navigation (`Nav.tsx`)

### Current Issues

- Active state uses `bg-opacity-10` on the blue background → icon is barely visible against a near-transparent fill; the `text-white` class has no effect
- Icon-only sidebar with no label visible at any point on desktop (only `title` tooltip on hover)
- Hover uses `hover:text-white` but the hover bg is also `bg-opacity-10` so text turns white against a near-invisible background — low contrast
- Mobile pill nav has no scroll indicator if content is wider than the screen

### Proposed Changes

| Area             | Change                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| Active state     | Solid `bg-[var(--apujo-blue)]` with **no** opacity modifier; icon stays white                                   |
| Hover state      | Solid `bg-slate-100 dark:bg-slate-800` with the icon color shifting to `var(--apujo-blue)` — drop the red hover |
| Desktop labels   | Show a floating label to the right of the icon on hover (a small pill, CSS-only, no JS)                         |
| Active indicator | 3 px left-edge accent bar using `before:` pseudo-element                                                        |
| Transition       | Upgrade from `duration-150` to `duration-200 ease-out` with `scale-95 → scale-100` on active                    |
| Mobile           | Replace static pill with a `gap-2` row; add `aria-label` visible as a tiny label under each icon                |

### Code sketch (Nav active class)

```tsx
// Replace the active className with:
active
  ? "bg-[var(--apujo-blue)] text-white shadow-md scale-100"
  : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--apujo-blue)] scale-100";
```

---

## 2. Home Page (`app/page.tsx`)

### Current Issues

- The `PJ` initials circle is static; no visual depth
- "Latest Works" section has no imagery fallback beyond plain cards
- No "Latest Analytics" preview — analytics is a key page

### Proposed Changes

- **Hero:** Replace the gradient circle with a `ring-4 ring-[var(--apujo-blue)]/20` bordered avatar placeholder; add a subtle animated gradient shimmer around it via a CSS `@keyframes` ring pulse
- **Hero text:** Add a one-line subtitle tag like `Public Finance × Tech × Economics` in a muted monospace font below the name
- **CTA buttons:** Add a third button `Analytics →` next to the existing two
- **Works cards:** Add file-type or year badge in the top-right corner; fix `line-clamp-3` to `line-clamp-2` for uniformity
- **New section:** "Latest Analytics" — 2-column grid with icon badges (📓 notebook, 📊 graph, 🌐 html)

---

## 3. About Page (`app/about/page.tsx`)

### Current Issues

- Work experience is in a `<table>` with manual spacing via `borderSpacing` — fragile and semantically odd
- Skills are flat undifferentiated badges
- Education section is just two `flex` rows with no visual separation
- No social/contact links in a prominent spot

### Proposed Changes

#### 3a. Timeline for Work Experience

Replace the `<table>` with a vertical timeline:

```
[period]  ●—— [Title at Org]
               [Description line]
          |
[period]  ●—— ...
```

- Use a `border-l-2 border-slate-200` left rail with a filled dot (`w-3 h-3 rounded-full bg-[var(--apujo-blue)]`) at each entry
- Period as a `text-xs uppercase tracking-widest` badge above each entry

#### 3b. Grouped Skills

Categorize skills into 3 groups with a small header:

| Group          | Items                                        |
| -------------- | -------------------------------------------- |
| Frontend       | TypeScript, React/Next.js, Tailwind CSS      |
| Backend & Data | FastAPI, Python, Data Analysis               |
| Infrastructure | MySQL/PostgreSQL, SQL/DB Design, Docker, Git |

#### 3c. Education Cards

Replace plain `flex` rows with small bordered cards; show degree + institution + graduation year/status.

#### 3d. Social Links Section

Add GitHub + LinkedIn icon-button row above the email contact.

---

## 4. Thoughts Page (`app/thoughts/page.tsx`)

### Current Issues

- `max-w-100vw` is not a valid Tailwind v4 class — likely renders as nothing, making the container full-bleed
- Lead story image uses `h-64` but no aspect-ratio lock — tall images cause layout shift
- No reading-time estimate or category tags
- Rest of items render in a plain `space-y` list without a grid

### Proposed Changes

- Fix `max-w-100vw` → `max-w-7xl`
- Lead article: use `aspect-video` on the image wrapper instead of fixed height
- Secondary cards: switch to `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- Add a computed **reading time** (`Math.ceil(wordCount / 200)` min) shown as a badge
- Add a **"Load more"** button that appends instead of replacing (infinite append pagination) instead of Previous/Next jump navigation

---

## 5. Works Page (`app/works/page.tsx`)

### Current Issues

- Cards are always `md:flex-row` (horizontal) regardless of content — images become very wide on desktop for small-image items
- "View project →" plain text link is low-affordance
- No year filter or tag system

### Proposed Changes

- Change layout to a `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` masonry-style (pure grid, no extra library)
- Card redesign: full-width image on top (`aspect-video object-cover`) → title → excerpt → year + "View →" row at bottom
- Add a hover `ring-2 ring-[var(--apujo-blue)] scale-[1.01]` lift effect
- "View project" button → styled as `bg-[var(--apujo-blue)] text-white rounded-md px-3 py-1 text-xs`

---

## 6. Analytics List Page (`app/analytics/page.tsx`)

### Current Issues

- Items show no indication of file type (ipynb vs pdf vs html vs graph)
- Plain card with no visual hierarchy
- Pagination is Previous/Next with no item count shown

### Proposed Changes

- **File type badge:** Detect from `file_type` field and render a colored badge:
  - `📓 Notebook` — indigo
  - `📄 PDF` — red
  - `🌐 HTML` — green
  - `📊 Graph` — orange
- Card redesign: left accent border color matching the badge type; title in Playfair font; date + badge in a row at bottom
- **Search bar** (client-side filter on loaded items) with a magnifier icon
- Show item count: `Showing 1–10 of N`

---

## 7. Analytics Detail Page (`app/analytics/[slug]/page.tsx`) — **CRITICAL**

This is the most important section of the proposal.

### 7a. Current State

| Type                                   | Status                                                                                                                                                                                                                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.ipynb` (JSON)                        | ✅ Renders via `react-ipynb-renderer` (gruvboxd theme)                                                                                                                                                                                                                                  |
| `.pdf`                                 | ⚠️ Renders via `react-pdf` but has a bug: `pdfWidth` is only set after `item` loads, yet `pdfContainerRef` isn't mounted until the PDF branch renders — the `useEffect` for width fires before the ref exists. Falls back to `<iframe>` correctly but the `react-pdf` path never fires. |
| `.html`                                | ❌ Not handled — falls through to the download fallback                                                                                                                                                                                                                                 |
| Standalone graphs (Plotly HTML export) | ❌ Not handled                                                                                                                                                                                                                                                                          |
| `useRouter` from `next/router`         | ⚠️ Imported but Next.js 13+ App Router requires `next/navigation`. It's unused so no crash, but should be removed.                                                                                                                                                                      |

### 7b. Proposed Fixes & Additions

#### Fix 1 — Remove bad import

```tsx
// Remove this line:
import { useRouter } from "next/router";
```

#### Fix 2 — PDF width detection

The `pdfContainerRef` only exists when the PDF branch renders, but the width `useEffect` runs on `[item]` change before the DOM is painted. Fix by using a `ResizeObserver` pattern within the PDF render branch:

```tsx
// In the PDF render branch, replace the outer useEffect width logic with:
const pdfContainerRef = React.useRef<HTMLDivElement>(null);
const [pdfWidth, setPdfWidth] = React.useState<number>(800);

useEffect(() => {
  if (!pdfContainerRef.current) return;
  const obs = new ResizeObserver(([entry]) => {
    setPdfWidth(entry.contentRect.width);
  });
  obs.observe(pdfContainerRef.current);
  return () => obs.disconnect();
}, []); // runs once the branch mounts
```

Move `pdfContainerRef` and `pdfWidth` state inside a `PDFViewer` sub-component so they only exist when needed.

#### Fix 3 — PDF pagination UI

Currently there's no "Previous page / Next page" UI in the PDF branch. Add a pagination row:

```tsx
<div className="flex items-center gap-4 mt-3">
  <button
    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
    disabled={pageNumber <= 1}
  >
    ←
  </button>
  <span className="text-sm">
    Page {pageNumber} of {numPages}
  </span>
  <button
    onClick={() => setPageNumber((p) => Math.min(numPages!, p + 1))}
    disabled={pageNumber >= (numPages ?? 1)}
  >
    →
  </button>
</div>
```

#### Fix 4 — HTML file rendering (NEW)

Add a new render branch for `text/html` or `.html` files. Use a **sandboxed `<iframe>`** — the safest approach since these could be Plotly/Vega/custom HTML exports:

```tsx
if (item.file_type === "text/html" || item.file_url.endsWith(".html")) {
  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold">{item.title}</h1>
        <p className="text-sm text-zinc-600">{item.excerpt}</p>
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
        <a href={fileUrl} download className="text-sm text-[var(--apujo-blue)]">
          Download HTML ↓
        </a>
      </main>
    </div>
  );
}
```

> **Security note:** `sandbox="allow-scripts allow-same-origin"` lets Plotly/Vega charts execute their bundled JS while blocking form submissions, top-level navigation, and cross-origin requests. Do NOT use `allow-same-origin` alone without `allow-scripts` — together they are safe for trusted self-hosted files.

#### Fix 5 — Graph / Plotly HTML support (via upload type)

For `text/html` graph exports from Python (`fig.write_html("output.html")`), Fix 4 covers it automatically. For `.ipynb` files that contain Plotly/Altair/Matplotlib outputs, `react-ipynb-renderer` already renders static outputs. For **live** Plotly within a notebook you'd need a kernel — this is out of scope. The recommended workflow:

> **Recommended workflow for analytics uploads:**
>
> 1. `.ipynb` — static cell outputs rendered → best for exploration notes
> 2. `fig.write_html(...)` → upload `.html` file → full interactive Plotly/Vega/Bokeh/ECharts
> 3. Static charts → export as `.png`/`.svg` and embed in `<img>` via the HTML renderer

#### Fix 6 — Notebook theme + download always visible

- Add a small "Download" button in the top-right of every analytic detail page regardless of type (not just the fallback)
- Add `react-ipynb-renderer` theme toggle: `gruvboxd` (dark) ↔ `atom` (light) controlled by the site's current theme

#### Fix 7 — Loading/error states polish

Replace the plain `<div>Loading...</div>` and `<div>Not found</div>` with the existing `<Spinner />` component and a styled error card.

### 7c. Backend consideration

The backend must set the correct `Content-Type` header when serving files from `/static/uploads/analytics/`. For HTML files served via FastAPI `FileResponse`, set:

```python
# In the uploads/analytics route:
return FileResponse(path, media_type="text/html")
```

The frontend `item.file_type` field (stored in the DB) should be `"text/html"` for HTML uploads. The admin upload form should detect `.html` → set `file_type = "text/html"`.

---

## 8. Globals & Design System Tokens (minor)

- Add `--apujo-green: #1d6a3a` and `--apujo-amber: #b45309` to `:root` for badge colors in analytics
- Extract card base styles into a Tailwind `@layer components` utility to keep card markup consistent
- Consider adding `transition-all duration-200` to the `body` for smoother theme toggle

---

## Implementation Order

| Priority | Item                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 🔴 P0    | Analytics slug: remove bad import, add HTML renderer, fix PDF width/pagination |
| 🟠 P1    | Nav active state fix (contrast bug)                                            |
| 🟠 P1    | Analytics list: file type badges                                               |
| 🟡 P2    | About page: timeline + grouped skills                                          |
| 🟡 P2    | Home: add Analytics CTA + section                                              |
| 🟢 P3    | Thoughts: layout fix + reading time                                            |
| 🟢 P3    | Works: masonry grid + card redesign                                            |
| 🔵 P4    | Notebook theme sync + download button                                          |

---

_Let me know which items to proceed with and I'll implement them._
