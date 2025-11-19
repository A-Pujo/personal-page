export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-6 py-20">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-black dark:text-zinc-50">
              A-Pujo
            </h1>
            <p className="text-lg text-zinc-700 dark:text-zinc-300 max-w-xl">
              Design-focused frontend developer. I build elegant and fast
              personal sites, blogs, and small web apps. I care about
              typography, clarity, and performance.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/about"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--apujo-blue)] text-white px-4 py-2 text-sm font-medium hover:bg-[#002f6f]"
              >
                About
              </a>
              <a
                href="/thoughts"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Thoughts
              </a>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-[var(--apujo-red)] to-[var(--apujo-blue)] shadow-lg flex items-center justify-center text-white text-xl font-semibold">
              PJ
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Latest
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <article className="rounded-md border border-slate-100 p-4 bg-white">
              <h3 className="text-lg font-medium">Placeholder thought title</h3>
              <p className="text-sm text-zinc-600 mt-2">
                Short excerpt about the thought or article.
              </p>
            </article>
            <article className="rounded-md border border-slate-100 p-4 bg-white">
              <h3 className="text-lg font-medium">Project highlight</h3>
              <p className="text-sm text-zinc-600 mt-2">
                Short description of a recent project.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
