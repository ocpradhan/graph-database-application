import { GraphData, NodeDetails, GraphNode } from "@/types/graph";

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
