"use client";

import { useEffect } from "react";

// Shown if the backend still isn't reachable after the retries in lib/api.ts.
// It retries automatically so visitors aren't stuck on an error screen while the server wakes up.
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    const timer = setTimeout(reset, 10000);
    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-5xl">🍳</div>
      <h1 className="text-2xl font-bold">Our kitchen is warming up…</h1>
      <p className="text-gray-600 max-w-md">
        The menu is taking a moment to load. This page will refresh by itself in a few seconds.
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-orange-600 px-6 py-2 font-semibold text-white hover:bg-orange-700"
      >
        Try again
      </button>
    </main>
  );
}
