import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { authLogout } from "~/lib/api";
import { FileText, Briefcase, BarChart2 } from "lucide-react";

const sections = [
  {
    to: "/admin/dashboard/thoughts",
    label: "Thoughts",
    desc: "Manage blog posts and articles",
    Icon: FileText,
  },
  {
    to: "/admin/dashboard/works",
    label: "Works",
    desc: "Manage portfolio projects",
    Icon: Briefcase,
  },
  {
    to: "/admin/dashboard/analytics",
    label: "Analytics",
    desc: "Manage analytics reports and notebooks",
    Icon: BarChart2,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("apujo_token");
    if (!token) navigate("/admin", { replace: true });
  }, [navigate]);

  function handleLogout() {
    authLogout();
    navigate("/admin", { replace: true });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-md border border-slate-200 dark:border-slate-700 px-4 py-1.5 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map(({ to, label, desc, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <Icon className="w-7 h-7 text-[var(--apujo-blue)] mb-3" />
            <p className="font-semibold">{label}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
