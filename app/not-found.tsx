import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-100 w-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <Search className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          404 - Page Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The node or view route you are looking for does not exist in the graph
          dashboard.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
