import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getGraphData } from "@/lib/db/queries";
import { GraphData } from "@/types/graph";

export default async function DashboardPage() {
  let initialGraph: GraphData = { nodes: [], edges: [] };

  try {
    initialGraph = await getGraphData();
  } catch (error) {
    console.error("Failed to fetch initial graph server-side:", error);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardClient initialGraphData={initialGraph}>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Supply Chain Resilience Tracker
            </h1>
            <p className="text-sm text-slate-600">
              Powered by{" "}
              <span className="font-semibold text-blue-600">
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
