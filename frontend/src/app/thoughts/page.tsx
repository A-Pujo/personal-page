import ThoughtsClient from "../../components/ThoughtsClient";

export default function Thoughts() {
  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Thoughts</h1>
        <ThoughtsClient />
      </main>
    </div>
  );
}
