import Link from "next/link";
import AdminWorksPanel from "../../../../components/AdminWorksPanel";
import { ArrowLeft } from "lucide-react";

export default function AdminWorksPage() {
  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="text-sm text-zinc-600 hover:text-[var(--apujo-red)]"
          >
            <ArrowLeft className="inline" /> back
          </Link>
        </div>
        <div className="mb-4 flex items-center gap-4">
          <h1 className="text-2xl font-bold">Manage Works</h1>
          <div className="ml-auto">
            <Link
              href="/admin/dashboard/works/new"
              className="px-3 py-1 bg-[var(--apujo-blue)] text-white rounded text-sm"
            >
              New Work
            </Link>
          </div>
        </div>
        <AdminWorksPanel />
      </main>
    </div>
  );
}
