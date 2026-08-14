import {
  GraphData,
  CreateNodeParams,
  UpdateNodeParams,
  NodeDetails,
  GraphNode,
} from "@/types/graph";

export interface ServiceError {
  status?: number;
  message?: string;
  errors?: Record<string, string>;
}

export interface BlastRadiusResponse {
  message: "success" | false;
  analytics?: { impactedNodeIds: string[]; [key: string]: unknown };
  error?: string;
}

export interface GraphResponse {
  message: "success" | false;
  data?: GraphData;
  error?: string;
}

export interface NodeDetailsResponse {
  message: "success" | false;
  data?: NodeDetails;
  error?: string;
}

export interface CreateNodeResponse {
  message: "success" | false;
  data?: GraphNode;
  errors?: Record<string, string>;
  error?: string;
}

export interface UpdateNodeResponse {
  message: "success" | false;
  data?: GraphNode;
  errors?: Record<string, string>;
  error?: string;
}

export interface DeleteNodeResponse {
  message: "success" | false;
  data?: { id: string };
  error?: string;
}

export interface SeedGraphResponse {
  message: "success" | false;
  data?: unknown;
  error?: string;
}

export interface CreateRelationshipResponse {
  message: "success" | false;
  data?: { id: string };
  error?: string;
}

export async function fetchGraph(): Promise<GraphData> {
  const res = await fetch("/api/graph", { cache: "no-store" });
  const json: GraphResponse = await res.json();

  if (!res.ok || json.message !== "success" || !json.data) {
    throw new Error(json.error || "Failed to load graph data");
  }
  return json.data;
}

export async function fetchNodeDetails(id: string): Promise<NodeDetails> {
  const res = await fetch(`/api/nodes/${encodeURIComponent(id)}`);
  const json: NodeDetailsResponse = await res.json();

  if (!res.ok || json.message !== "success" || !json.data) {
    throw new Error(json.error || "Failed to load node details");
  }

  return json.data;
}

export async function createNode(params: CreateNodeParams): Promise<GraphNode> {
  const res = await fetch("/api/nodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const json: CreateNodeResponse = await res.json();

  if (!res.ok || json.message !== "success" || !json.data) {
    // Reject with custom error shape so catch block receives field errors!
    return Promise.reject({
      status: res.status,
      errors: json.errors,
      message: json.error || "Failed to create entity",
    });
  }

  return json.data;
}

export async function updateNode(params: UpdateNodeParams): Promise<GraphNode> {
  const res = await fetch(`/api/nodes/${encodeURIComponent(params.id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const json: UpdateNodeResponse = await res.json();

  if (!res.ok || json.message !== "success") {
    return Promise.reject({
      status: res.status,
      errors: json.errors,
      message: json.error || "Failed to update node",
    });
  }

  return json.data as GraphNode;
}

export async function deleteNode(id: string): Promise<void> {
  const res = await fetch(`/api/nodes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  const json: DeleteNodeResponse = await res.json();

  if (!res.ok || json.message !== "success") {
    throw new Error(json.error || "Failed to delete node");
  }
}

export async function seedGraph(): Promise<void> {
  const res = await fetch("/api/seed", { method: "POST" });
  const json: SeedGraphResponse = await res.json();

  if (!res.ok || json.message !== "success") {
    throw new Error(json.error || "Failed to seed database");
  }
}

export async function simulateBlastRadius(
  nodeId: string,
): Promise<BlastRadiusResponse> {
  const res = await fetch(
    `/api/analytics/blast-radius?nodeId=${encodeURIComponent(nodeId)}`,
  );

  const data: BlastRadiusResponse = await res.json();

  if (!res.ok || data.message !== "success")
    throw new Error(data.error || "Failed to simulate blast radius");
  return data;
}

export async function createRelationship(
  sourceId: string,
  targetId: string,
  relationshipType = "SUPPLIES",
): Promise<{ id: string }> {
  const res = await fetch("/api/relationships", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceId, targetId, relationshipType }),
  });

  const json: CreateRelationshipResponse = await res.json();

  if (!res.ok || json.message !== "success" || !json.data) {
    throw new Error(json.error || "Failed to connect edges");
  }

  return json.data;
}
