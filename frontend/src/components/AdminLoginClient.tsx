"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "../lib/api";
import Spinner from "./Spinner";
import { toast } from "react-toastify";

export default function AdminLoginClient() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
            {loading ? <Spinner /> : null}
            <span>Sign in</span>
          </button>
        </div>
      </form>
    </div>
  );
}
