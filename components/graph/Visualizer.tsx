// Dynamic Graph Canvas (React Flow / Cytoscape)
"use client";

import { useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  addEdge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GraphNode, GraphEdge } from "@/types/graph";
import { toast } from "sonner";
import { CustomNode } from "../nodes/CustomNode";

interface VisualizerProps {
  initialNodes: GraphNode[];
  initialEdges: GraphEdge[];
  selectedNode: GraphNode | null;
  impactedNodeIds: string[];
  onSelectNode: (node: GraphNode) => void;
}

export interface NodeData extends Record<string, unknown> {
  graphNode: GraphNode;
  isImpacted?: boolean;
}

const nodeTypes = {
  customNode: CustomNode,
};

export function GraphVisualizer({
  initialNodes,
  initialEdges,
  selectedNode,
  impactedNodeIds,
  onSelectNode,
}: VisualizerProps) {
  const initialFlowNodes: Node<NodeData>[] = useMemo(() => {
    return initialNodes?.map((node, idx) => ({
      id: node.id,
      type: "customNode" as const,
      data: {
        graphNode: node,
        isImpacted: impactedNodeIds.includes(node.id),
      },
      position: {
        x: (idx % 3) * 280 + 80,
        y: Math.floor(idx / 3) * 180 + 80,
      },
    }));
  }, [initialNodes, impactedNodeIds]);

  const initialFlowEdges: Edge[] = useMemo(() => {
    return initialEdges?.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.relationship,
    }));
  }, [initialEdges]);

  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<NodeData>>(initialFlowNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<Edge>(initialFlowEdges);

  useEffect(() => {
    setNodes(initialFlowNodes);
  }, [initialFlowNodes, setNodes]);

  useEffect(() => {
    setEdges(initialFlowEdges);
  }, [initialFlowEdges, setEdges]);

  // Compute dynamic visual styles for nodes based on selecteion & impact states
  const flowNodes = useMemo(() => {
    return nodes?.map((node) => {
      const isImpacted = impactedNodeIds.includes(node.id);
      const isSelected = selectedNode?.id === node.id;

      return {
        ...node,
        selected: isSelected,
        data: {
          ...node.data,
          isImpacted,
        },
      };
    });
  }, [nodes, impactedNodeIds, selectedNode]);

  const flowEdges = useMemo(() => {
    return edges?.map((edge) => {
      const isImpacted =
        impactedNodeIds.includes(edge.source) &&
        impactedNodeIds.includes(edge.target);

      return {
        ...edge,
        animated: isImpacted,
        style: {
          stroke: isImpacted ? "#e11d48" : "#94a3b8",
          strokeWidth: isImpacted ? 3 : 1.5,
        },
        labelStyle: {
          fill: "#cbd5e1",
          fontWeight: 600,
          fontSize: 10,
        },
        labelBgStyle: {
          fill: "#1e293b",
          rx: 4,
          ry: 4,
        },
        labelBgPadding: [6, 4] as [number, number],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isImpacted ? "#e11d48" : "#94a3b8",
        },
      };
    });
  }, [edges, impactedNodeIds]);

  const onConnect = async (connection: Connection) => {
    if (!connection.source || !connection.target) return;

    // 1. Call your API to store the relationship in CognoDB
    const res = await fetch("/api/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceId: connection.source,
        targetId: connection.target,
        relationshipType: "SUPPLIES",
      }),
    });

    if (res.ok) {
      setEdges((eds) => addEdge(connection, eds));
      toast.success("Edge connected successfully.");
    } else {
      const errorData = await res.json();
      console.error("Failed to create relationship:", errorData.error);
      toast.error("Failed to connect edges.");
    }
  };

  return (
    <div className="h-150 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-inner">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => {
          onSelectNode(node.data.graphNode);
        }}
        onConnect={onConnect}
        fitView
        nodesDraggable={true}
      >
        <Background
          gap={16}
          size={1}
          className="bg-slate-50 dark:bg-slate-900"
          color="currentColor"
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}
