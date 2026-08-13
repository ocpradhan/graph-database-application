import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-100 w-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <Search className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          404 - Page Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The node or view route you are looking for does not exist in the graph
          dashboard.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-5 py-2.5 text-sm font-medium transition-all shadow-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
