# Frontend Development Guide — A-Pujo Personal Page

This document describes the frontend plan, conventions, and tasks for the A-Pujo personal-site frontend. Tech stack: Next.js, Tailwind CSS, and shadcn UI. Main brand colors: `#c1121f` (primary red) and `#003f88` (primary blue).

## Goals

- Fast, accessible personal site with blog/thoughts, work portfolio, and analytics integration.
- Clean developer DX with predictable structure and component library using `shadcn/ui` + Tailwind.
- Minimal but extensible styling and design tokens so colors and spacing are easy to change.

## Tech Stack

- Framework: `Next.js` (latest stable)
- Styling: `Tailwind CSS` + optional `@tailwindcss/forms`, `@tailwindcss/typography`
- Component primitives: `shadcn/ui` (Radix primitives + Tailwind)
- Component primitives: `shadcn/ui` (Radix primitives + Tailwind)
- Icons: `lucide-react` (lightweight, tree-shakeable icon set)
- Language: `TypeScript` (recommended)
- Linting: `ESLint` + `Prettier`
- Testing: `vitest` or `jest` + `testing-library/react`

## Project structure (recommended)

Example high-level layout for the frontend repo root:

```
app/ or pages/         # Next.js pages (app router recommended)
	(home)/page.tsx
	about/page.tsx
	thoughts/             # articles or mdx
	works/
	analytics/
components/            # shared UI components
lib/                   # helper functions, API clients
styles/                # tailwind.css entry and global styles
public/                # static assets
hooks/                 # custom hooks
types/                 # shared TypeScript types
tests/
next.config.js
tailwind.config.js
postcss.config.js
package.json
tsconfig.json
README.md
```

## Navigation / Menus

- Top-level menu (site-wide): `Home`, `About`, `Thoughts`, `Works`, `Analytics`, `Admin`.
- Use accessible nav element and focus styles (Tailwind + shadcn components help).

Design suggestion: keep a simple header with logo/name and compact mobile hamburger menu. Show active route with underline or color accent.

## Design tokens / Colors

Primary colors:

- Red: `--color-primary-red: #c1121f`
- Blue: `--color-primary-blue: #003f88`

Tailwind extension (example snippet for `tailwind.config.js`):

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        "apujo-red": "#c1121f",
        "apujo-blue": "#003f88",
      },
    },
  },
};
```

Also expose CSS variables in `:root` (useful for runtime theming):

```css
:root {
  --apujo-red: #c1121f;
  --apujo-blue: #003f88;
}
```

## Pages & routing

- `/` — Home: hero, short intro, highlight latest thoughts/works.
- `/about` — About: bio, contact, resume link.
- `/thoughts` — Thoughts: article index (support MDX or Markdown -> static pages).
- `/thoughts/[slug]` — Article detail page (static generation + incremental regeneration).
- `/works` — Works: portfolio, projects with descriptions and links.
- `/analytics` — Analytics: UI surface for collected metrics (backed by microservice(s); TBD).

- `/admin` — Admin: management UI for site content, analytics controls and feature toggles (protected route; add auth).

Routing notes:

- Prefer Next.js App Router (if using Next 13+) for server components and nested layouts.
- Use `getStaticProps` / `getStaticPaths` or new `generateStaticParams` for blog pages to keep site fast.

## Content & Data

- Thoughts/articles: use MDX or a headless CMS (Dev.to, Contentful, Sanity, or simple Markdown in repo).
- Works: store metadata in `lib/works.ts` or a small JSON/YAML file, or use a CMS.

## Analytics microservice (placeholder)

- Analytics will be implemented as microservices (backend FastAPI). For now, create a frontend placeholder page and an API client that can be swapped in later.
- Keep the `/analytics` route behind a feature flag until the service exists.

## Integration with shadcn/ui

- Use `shadcn/ui` for common primitives like buttons, dialogs, forms and tailored components.
- Keep a `components/ui/` folder for wrapped shadcn components (so you can standardize props, sizes, and spacing).

## Icons

- Use `lucide-react` for icons: it's lightweight, tree-shakeable, and pairs well with Tailwind and shadcn primitives.
- Install: `npm install lucide-react` or `yarn add lucide-react`.
- Accessibility: when icons are decorative use `aria-hidden="true"`; when they convey meaning use `aria-label` or include visually-hidden text.

Example usage (nav with icons):

```tsx
// components/Nav.tsx (sketch with lucide icons)
import Link from "next/link";
import {
  Home,
  User,
  FileText,
  Briefcase,
  BarChart2,
  Shield,
} from "lucide-react";

const links = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/about", label: "About", Icon: User },
  { href: "/thoughts", label: "Thoughts", Icon: FileText },
  { href: "/works", label: "Works", Icon: Briefcase },
  { href: "/analytics", label: "Analytics", Icon: BarChart2 },
  { href: "/admin", label: "Admin", Icon: Shield },
];

export default function Nav() {
  return (
    <nav className="flex gap-4 items-center">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="flex items-center gap-2 text-sm font-medium hover:text-apujo-blue"
        >
          <l.Icon className="w-4 h-4" aria-hidden="true" />
          <span>{l.label}</span>
        </Link>
      ))}
    </nav>
  );
}
```

## Tailwind setup notes

- Install `tailwindcss` + `postcss` + `autoprefixer` and initialize.
- Add `tailwind.css` under `styles/`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --apujo-red: #c1121f;
  --apujo-blue: #003f88;
}
```

Enable these useful plugins:

- `@tailwindcss/typography` for article content
- `@tailwindcss/forms` for consistent form styling

Example install commands (copyable):

```sh
npm install -D tailwindcss postcss autoprefixer @tailwindcss/typography @tailwindcss/forms
npx tailwindcss init -p
```

## Accessibility & SEO

- Use semantic HTML for headings, nav, main, footer.
- Ensure focus-visible states, color contrast (check `#c1121f` and `#003f88` on backgrounds), and keyboard navigation.
- Add meta tags, open graph tags, and structured data for articles.

## Development scripts (recommended in `package.json`)

- `dev` — `next dev`
- `build` — `next build`
- `start` — `next start`
- `lint` — run ESLint
- `format` — run Prettier

## Linting & Formatting

- ESLint with recommended Next.js config.
- Prettier for consistent formatting.

## Testing

- Unit: `vitest` + `@testing-library/react`
- E2E: optional Playwright or Cypress for critical flows

## Environment variables

Keep these in `.env.local` (do not commit). Example variables:

- `NEXT_PUBLIC_API_BASE_URL` — base URL for backend / analytics APIs
- `NEXT_PUBLIC_ANALYTICS_ENABLED` — feature flag for analytics UI

## Dev workflow & conventions

- Branching: feature branches `feat/<short-name>`, fix branches `fix/<short-name>`.
- Commits: Conventional Commits style (`feat:`, `fix:`, `chore:`).
- Tests: write unit tests for complex components (forms, list rendering).

## Example component: simple nav (Tailwind + shadcn idea)

```tsx
// components/Nav.tsx (sketch)
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/thoughts", label: "Thoughts" },
  { href: "/works", label: "Works" },
  { href: "/analytics", label: "Analytics" },
];

export default function Nav() {
  return (
    <nav className="flex gap-6 items-center">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="text-sm font-medium hover:text-apujo-blue"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
```

## Tasks / Milestones

- [ ] Initialize Next.js project with TypeScript
- [ ] Install Tailwind CSS and configure colors
- [ ] Add `shadcn/ui` and set up base components
- [ ] Implement `Home`, `About`, `Thoughts` index, and `Works` pages
- [ ] Add MDX support for `Thoughts` (or choose CMS)
- [ ] Create `Nav`, `Footer`, and `Article` components
- [ ] Add ESLint/Prettier and initial tests
- [ ] Create placeholder `Analytics` UI and API client
- [ ] Prepare deployment (Vercel recommended) and CI (github actions)

## Progress

- [x] Started frontend development: repository inspected and project recognized.
- [x] Added responsive `Nav` component at `frontend/src/components/Nav.tsx` (left-fixed on desktop; bottom-centered round container on mobile) using `lucide-react` icons.
- [x] Updated `frontend/src/app/layout.tsx` to include `Nav` and load Google fonts (`Inter` for body and `Playfair Display` for headings).
- [x] Updated `frontend/src/app/globals.css` with brand color variables and font-family mappings.

- [x] Refined navigation styling to use brand colors `#c1121f` (red) and `#003f88` (blue); improved hover and active states for desktop and mobile nav.
- [x] Rewrote navigation to use Tailwind utility classes only (removed custom nav helpers).
- [x] Added `tailwind.config.js` with `apujo-red` and `apujo-blue` tokens in `frontend/`.
- [x] Add README and instructions (frontend/README.md)

Next steps:

- Install dependencies and run the dev server (`cd frontend && npm install && npm run dev`).
- Iterate on spacing, font sizes, and accessibility (I can do refinements if you'd like).

Estimate: 1–2 weeks for a single developer to get a polished MVP depending on content readiness.

## Deployment

- Frontend: Vercel (easy for Next.js) or static export if appropriate.
- Backend analytics (FastAPI): separate service (e.g., deployed to Fly, Render, or AWS/GCP).

## Notes & Improvements (future)

- Add i18n support if needed.
- Add image optimization strategy (Next/Image or external service).
- Consider offline caching strategies if you want a PWA.

## References

- `Next.js` docs — https://nextjs.org/docs
- `Tailwind CSS` — https://tailwindcss.com/docs
- `shadcn/ui` — https://ui.shadcn.com/

---

If you'd like, I can:

- scaffold the initial Next.js + Tailwind project files,
- add the `Nav` & `Home` page components,
- or create the MDX/blog pipeline now.

Tell me which step you want next and I'll implement it.
