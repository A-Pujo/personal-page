"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLoginClient from "../../components/AdminLoginClient";
import Spinner from "../../components/Spinner";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

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
            <AdminLoginClient />
          )}
        </div>
      </main>
    </div>
  );
}
