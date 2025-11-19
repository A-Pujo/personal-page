"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLoginClient from "../../components/AdminLoginClient";
import Spinner from "@/components/Spinner";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("apujo_token")
          : null;
      if (token) {
        router.replace("/admin/dashboard");
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <div className="min-h-screen px-6 py-20">
      <main className="mx-auto max-w-3xl">
        {loading ? <Spinner /> : <AdminLoginClient />}
      </main>
    </div>
  );
}
