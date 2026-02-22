"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="font-serif text-4xl text-black dark:text-white">
          Something went wrong
        </h1>
        <p className="text-sm text-neutral-500">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black text-xs uppercase tracking-[0.2em] font-black rounded-full hover:opacity-80 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
