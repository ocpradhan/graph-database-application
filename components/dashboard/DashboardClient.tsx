"use client";

import { useState } from "react";
import { GraphVisualizer } from "@/components/graph/Visualizer";
import { EntityModal } from "@/components/forms/EntityModal";
import { GraphData, GraphNode } from "@/types/graph";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  RefreshCw,
  Zap,
  ShieldAlert,
  Trash2,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardClientProps {
  initialGraphData: GraphData;
  children: React.ReactNode;
}

export function DashboardClient({
  initialGraphData,
  children,
}: DashboardClientProps) {
  const [data, setData] = useState<GraphData>(initialGraphData);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [impactedNodeIds, setImpactedNodeIds] = useState<string[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph");
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to load graph:", error);
      toast.error("Failed to synchronize graph data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNode = async () => {
    if (!selectedNode) return;
    setDeleting(true);

    try {
      const res = await fetch(
        `/api/nodes/${encodeURIComponent(selectedNode.id)}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        const deletedName = selectedNode.name;
        setSelectedNode(null);
        setImpactedNodeIds([]);
        await fetchGraph();

        toast.success(`Entity "${deletedName} deleted successfully."`);
      } else {
        toast.error("Failed to delete entity.");
      }
    } catch (error) {
      console.error("Failed to delete node:", error);
      toast.error("An error occurred while deleting the entity.");
    } finally {
      setDeleting(false);
    }
  };

  const seedData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        await fetchGraph();
        setSelectedNode(null);
        setImpactedNodeIds([]);

        toast.success("Database successfully reset & re-seeded!");
      } else {
        toast.error("Failed to re-seed database.");
      }
    } catch (error) {
      console.error("Failed to seed database:", error);
      toast.error("An error occurred while seeding the graph.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateDisruption = async () => {
    if (!selectedNode) return;
    setSimulating(true);
    try {
      const res = await fetch(
        `/api/analytics/blast-radius?nodeId=${selectedNode.id}`,
      );
      const json = await res.json();
      setImpactedNodeIds(json.impactedNodeIds || []);

      toast.info(
        `Blast radius calculated: ${json.impactedNodeIds?.length || 0} downstream nodes impacted.`,
      );
    } catch (error) {
      console.error("Failed to calculate blast radius:", error);
      toast.error("Failed to simulate blast radius.");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <>
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        {children}
        <div className="flex items-center gap-3">
          <EntityModal
            existingNodes={data.nodes}
            onSuccess={fetchGraph}
            initialData={null}
          />
          <EntityModal
            existingNodes={data.nodes}
            onSuccess={fetchGraph}
            initialData={selectedNode}
            trigger={
              <Button
                variant="outline"
                disabled={!selectedNode}
                className="cursor-pointer"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Entity
              </Button>
            }
          />
          <Button variant="outline" onClick={fetchGraph} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={seedData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="mr-2 h-4 w-4" />
            Reset & Seed Graph
          </Button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Graph Visualization Canvas */}
        <div className="lg:col-span-3">
          <GraphVisualizer
            initialNodes={data.nodes}
            initialEdges={data.edges}
            selectedNode={selectedNode}
            impactedNodeIds={impactedNodeIds}
            onSelectNode={(node) => {
              setSelectedNode(node);
              setImpactedNodeIds([]);
            }}
          />
        </div>

        {/* Inspector Panel */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Node Inspector</CardTitle>
              <CardDescription>
                Select a node in the graph canvas to analyze dependencies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Label
                    </span>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedNode.label}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Entity Name
                    </span>
                    <p className="text-base font-semibold">
                      {selectedNode.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      ID
                    </span>
                    <p className="text-base font-semibold">{selectedNode.id}</p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Risk Score
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant={
                          selectedNode.riskScore > 50
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {selectedNode.riskScore}/100
                      </Badge>
                    </div>
                  </div>

                  <hr className="my-2" />

                  <Button
                    onClick={handleSimulateDisruption}
                    disabled={simulating}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    {simulating
                      ? "Traversing Graph..."
                      : "Simulate Blast Radius"}
                  </Button>

                  <Button
                    onClick={handleDeleteNode}
                    disabled={deleting}
                    variant="outline"
                    className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover-text-rose-800"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? "Deleting..." : "Delete Entity"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                  <AlertCircle className="mb-2 h-8 w-8" />
                  <p className="text-sm">
                    Click any node in the graph to select it.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Impact Analysis Metrics */}
          {impactedNodeIds.length > 0 && (
            <Card className="border-rose-200 bg-rose-50/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-rose-900 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                  Blast Radius Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-rose-950">
                <p>
                  Disrupting{" "}
                  <span className="font-bold">{selectedNode?.name}</span>{" "}
                  cascades downstream to hit{" "}
                  <span className="font-bold text-rose-700">
                    {impactedNodeIds.length} entities{" "}
                  </span>
                  across the network.
                </p>
                <div className="pt-2 text-xs font-mono text-rose-800">
                  Impacted IDs: {impactedNodeIds.join(", ")}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
