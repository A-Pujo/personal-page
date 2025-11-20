"use client";
import React from "react";

export default function Spinner({ size = 6 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="animate-spin rounded-full border-4 border-gray-200 border-t-gray-700"
        style={{ width: 24, height: 24 }}
        role="status"
        aria-label="loading"
      />
    </div>
  );
}
