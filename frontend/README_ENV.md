Frontend environment and run commands

This project supports environment-specific files in `frontend/`:

- `.env.dev` — development API base (example provided)
- `.env.production` — production API base (example provided)

Next.js also supports `.env.local`, `.env.development`, and `.env.production` automatically. If you prefer automatic loading, rename `frontend/.env.dev` to `frontend/.env.development`.

Recommended commands (run from project root or `frontend` directory):

1. Install dependencies (use your package manager):

```bash
# from repo root (no cd required)
cd frontend
npm ci
# or
pnpm install
# or
yarn install
```

2. Development (loads `.env.dev`):

```bash
# Option A: use the new env-aware script (recommended)
npm run dev:env

# Option B: rely on Next's automatic loading if you renamed the file to .env.development
npm run dev
```

Default dev server: http://localhost:6565

3. Build for production (loads `.env.production` during build):

```bash
# build using .env.production
npm run build:env

# then start the production server (also loads .env.production)
npm run start:env
```

4. Direct commands (if you prefer not to use scripts)

```bash
# run dev with dotenv-cli
./node_modules/.bin/dotenv -e frontend/.env.dev -- next dev -p 6565

# build with dotenv-cli
./node_modules/.bin/dotenv -e frontend/.env.production -- next build
```

Notes and recommendations

- `NEXT_PUBLIC_API_BASE` must be set at build time for Next.js pages that use it on the server. For client-side code it can be read at runtime if you host the frontend separately, but keeping it in the env file used by the build keeps behavior consistent.
- If you deploy the frontend to Vercel/Netlify, set `NEXT_PUBLIC_API_BASE` in the platform's environment variables (they will override any file-based envs).
- If you use Docker or a CI pipeline, pass the env file or environment variables into the build step so `next build` sees `NEXT_PUBLIC_API_BASE`.
- To rename files for Next.js automatic loading:
  - `frontend/.env.dev` → `frontend/.env.development`
  - keep `frontend/.env.production` as-is for production builds

Troubleshooting

- If the app can't reach the backend, check the value of `NEXT_PUBLIC_API_BASE` in the built bundle or open the browser console/network to inspect requests.
- If you change `.env.production` and want to test locally, run `npm run build:env` again before `npm run start:env`.

If you want, I can also:

- Add a small `Makefile` with these commands
- Add a CI example (GitHub Actions) that builds with `frontend/.env.production` and deploys

Which would you like next?
