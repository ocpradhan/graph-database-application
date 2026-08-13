// Shared TypeScript interfaces & Zod schemas

export type NodeLabel = "Supplier" | "Component" | "Product" | "LogisticsHub";

export type EdgeRelationship = "SUPPLIES" | "PART_OF" | "SHIPPED_VIA";

export interface GraphNode {
  id: string;
  label: NodeLabel;
  name: string;
  riskScore: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: EdgeRelationship;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NodeDetails {
  id: string;
  name: string;
  label: GraphNode["label"];
  riskScore: number;
  connectToNodeId: string;
  relationshipType: string;
}

export interface CreateNodeParams extends GraphNode {
  connectToNodeId?: string;
  relationshipType?: EdgeRelationship;
}

export interface UpdateNodeParams {
  id: string;
  name: string;
  label: NodeLabel;
  riskScore: number;
  connectToNodeId?: string;
  relationshipType?: EdgeRelationship;
}
