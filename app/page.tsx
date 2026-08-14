import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getGraphData } from "@/lib/db/queries";
import { GraphData } from "@/types/graph";

export default async function Page() {
  let initialGraph: GraphData = { nodes: [], edges: [] };

  try {
    initialGraph = await getGraphData();
  } catch (error) {
    console.error("Failed to fetch initial graph server-side:", error);
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6 md:p-10 transition-colors">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardClient initialGraphData={initialGraph}>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Supply Chain Resilience Tracker
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Powered by{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                CognoDB Graph Engine
              </span>{" "}
              & Next.js
            </p>
          </div>
        </DashboardClient>
      </div>
    </main>
  );
}
