import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { authLogin } from "~/lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("apujo_token");
    if (token) navigate("/admin/dashboard", { replace: true });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await authLogin(username, password);
    setLoading(false);
    if (res.ok) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError(
        typeof res.error === "string" ? res.error : "Invalid credentials.",
      );
    }
  }

  return (
    <main className="flex h-[100svh] items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      {/* Single card containing logo + form */}
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
        {/* Logo banner — maintain aspect ratio */}
        <div
          className="w-full overflow-hidden"
          style={{ aspectRatio: "16 / 9" }}
        >
          <img
            src="/img/app-logo.jpeg"
            alt="A-Pujo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form body */}
        <div className="px-8 py-8">
          <h1 className="text-lg font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Sign in to your admin panel
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--apujo-blue)] focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--apujo-blue)] focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--apujo-blue)] text-white py-2.5 text-sm font-medium hover:bg-[#002f6f] disabled:opacity-60 transition-colors mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
