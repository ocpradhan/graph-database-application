"use client";

import { useEffect } from "react";
import { AlertTriangleIcon, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled runtime error captured by Error Boundary:", error);
  });

  return (
    <div className="flex min-h-100 w-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center shadow-lg backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <AlertTriangleIcon className="h-7 w-7" />
        </div>

        <h2 className="mb-2 text-xl font-bold text-slate-900">
          Something went wrong!
        </h2>

        <p className="mb-6 text-sm text-slate-600">
          {error.message ||
            "Unable to connect or process request with CognoDB. Please try re-synchronizing."}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
