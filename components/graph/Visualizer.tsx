// Dynamic Graph Canvas (React Flow / Cytoscape)
"use client";

import React, { useMemo } from "react";
import { ReactFlow, Background, Controls, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GraphNode, GraphEdge } from "@/types/graph";

interface VisualizerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNode) => void;
}

export function GraphVisualizer({
  nodes,
  edges,
  onSelectNode,
}: VisualizerProps) {
  const flowNodes: Node[] = useMemo(
    () =>
      nodes.map((n, idx) => ({
        id: n.id,
        data: { label: `${n.name} (${n.label})` },
        position: {
          x: (idx % 4) * 220 + 50,
          y: Math.floor(idx / 4) * 150 + 50,
        },
        className:
          "bg-background border-2 border-primary rounded-lg p-3 text-sm font-semibold shadow-md",
      })),
    [nodes],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.relationship,
        animated: true,
      })),
    [edges],
  );

  return (
    <div className="h-150 w-full rounded-xl border bg-card shadow-sm">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodeClick={(_, node) => {
          const match = nodes.find((n) => n.id === node.id);
          if (match) onSelectNode(match);
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
