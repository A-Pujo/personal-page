import { ArrowLeft } from "lucide-react";
import AdminThoughtsPanel from "../../../../components/AdminThoughtsPanel";
import Link from "next/link";

export default function AdminThoughtsPage() {
  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="text-sm text-zinc-600 text-sm text-zinc-600 hover:text-[var(--apujo-red)]"
          >
            <ArrowLeft className="inline" /> back
          </Link>
        </div>
        <div className="mb-4 flex items-center gap-4">
          <h1 className="text-2xl font-bold">Manage Thoughts</h1>
        </div>
        <AdminThoughtsPanel />
      </main>
    </div>
  );
}
