import ThoughtsClient from "../../components/ThoughtsClient";

export default function Thoughts() {
  return (
    <div className="min-h-screen px-6 py-20 bg-zinc-50">
      <main className="mx-auto max-w-100vw">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold leading-tight mb-2">
            Thoughts
          </h1>
          <p className="text-zinc-600">
            A curated collection of ideas and clearance.
          </p>
        </header>

        <section className="space-y-6">
          <ThoughtsClient />
        </section>
      </main>
    </div>
  );
}
