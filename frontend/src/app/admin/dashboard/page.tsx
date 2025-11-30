import Link from "next/link";
import { Briefcase, ChartColumn, FileText } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/dashboard/thoughts"
            className="block p-6 border rounded hover:shadow"
          >
            <div className="flex items-center gap-3">
              <FileText />
              <div>
                <h3 className="font-semibold">Thoughts</h3>
                <p className="text-sm text-zinc-600">
                  Manage blog posts and drafts
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/works"
            className="block p-6 border rounded hover:shadow"
          >
            <div className="flex items-center gap-3">
              <Briefcase />
              <div>
                <h3 className="font-semibold">Works</h3>
                <p className="text-sm text-zinc-600">Manage portfolio items</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/dashboard/analytics"
            className="block p-6 border rounded hover:shadow"
          >
            <div className="flex items-center gap-3">
              <ChartColumn />
              <div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-zinc-600">Manage analytics</p>
              </div>
            </div>
          </Link>

          <div className="block p-6 border rounded hover:shadow">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚙️</div>
              <div>
                <h3 className="font-semibold">Settings</h3>
                <p className="text-sm text-zinc-600">
                  Site settings and configuration
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
