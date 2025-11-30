"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import Spinner from "@/components/Spinner";
import { toast } from "react-toastify";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        setLoading(true);
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("apujo_token")
            : null;
        if (!token) return;

        // verify token server-side
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE || "http://localhost:6363"
          }/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!mounted) return;
        if (res.ok) {
          // trigger fade-out animation then redirect
          setRedirecting(true);
          setTimeout(() => router.replace("/admin/dashboard"), 500);
          return;
        }

        // invalid token: clear and stay on login
        try {
          localStorage.removeItem("apujo_token");
          localStorage.removeItem("apujo_refresh");
        } catch {}
      } catch (err) {
        // network or other error — fall through to show login
      } finally {
        if (mounted) setLoading(false);
      }
    }

    check();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await api.authLogin(username, password);
    if (!res.ok) {
      toast.error(res.error || `Login failed (${res.status})`);
      setLoading(false);
      return;
    }

    toast.success("Login successful");
    // wait 2 seconds then redirect
    setTimeout(() => {
      router.push("/admin/dashboard");
    }, 2000);
  }

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl">
        <div
          className={`transition-all duration-500 ease-in-out transform ${
            redirecting ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <div className="text-sm text-zinc-600 animate-pulse">
                Checking session…
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto py-12 px-6">
              <h2 className="text-2xl font-bold mb-4">Admin login</h2>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-sm">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full rounded border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="mt-1 block w-full rounded border px-3 py-2"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--apujo-blue)] text-white rounded"
                  >
                    {loginLoading ? <Spinner /> : null}
                    <span>Sign in</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
