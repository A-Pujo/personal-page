"use client";
import React from "react";

export default function Toast({
  message,
  kind = "info",
}: {
  message: string;
  kind?: "info" | "success" | "error";
}) {
  const color =
    kind === "error"
      ? "bg-red-600"
      : kind === "success"
      ? "bg-green-600"
      : "bg-zinc-800";
  return (
    <div
      className={`fixed bottom-6 right-6 text-white px-4 py-2 rounded shadow ${color}`}
      role="status"
    >
      {message}
    </div>
  );
}
