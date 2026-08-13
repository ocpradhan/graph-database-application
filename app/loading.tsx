import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 md:p-10 transition-colors">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Skeleton */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <Skeleton className="h-9 w-80 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-4 w-60 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-10 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </header>

        {/* Main Grid Workspace Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Graph Visualization Canvas Skeleton */}
          <div className="lg:col-span-3">
            <div className="flex h-150 w-full flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shadow-inner">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-500"></div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                  Querying CognoDB Graph Architecture...
                </p>
              </div>
            </div>
          </div>

          {/* Inspector Panel Skeleton */}
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-4 w-48 bg-slate-200 dark:bg-slate-800" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
