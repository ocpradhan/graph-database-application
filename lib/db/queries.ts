// Data access layer (DAL) for graph operations
import { PathSegment } from "neo4j-driver";
import { getCognoDriver } from "./cogno";
import {
  GraphData,
  GraphNode,
  GraphEdge,
  CreateNodeParams,
  UpdateNodeParams,
  NodeDetails,
} from "@/types/graph";

// Fetch full graph for visualization
export async function getGraphData(): Promise<GraphData> {
  const driver = getCognoDriver();
  const session = driver.session();

  try {
    const result = await session.run(`
        MATCH (n)
        OPTIONAL MATCH (n)-[r]->(m)
        RETURN n, r, m
        `);

    const nodesMap = new Map();
    const edgesMap = new Map();

    result.records.forEach((record) => {
      const nodeN = record.get("n");
      if (nodeN && !nodesMap.has(nodeN.properties.id)) {
        nodesMap.set(nodeN.properties.id, {
          id: nodeN.properties.id,
          label: nodeN.labels[0] as GraphNode["label"],
          name: nodeN.properties.name,
          riskScore: Number(nodeN.properties.riskScore || 0),
        });
      }

      const relR = record.get("r");
      const nodeM = record.get("m");
      if (relR && nodeM) {
        const edgeId =
          relR.properties.id ||
          `${nodeN.properties.id}->${nodeM.properties.id}`;
        if (!edgesMap.has(edgeId)) {
          edgesMap.set(edgeId, {
            id: edgeId,
            source: nodeN.properties.id,
            target: nodeM.properties.id,
            relationship: relR.type as GraphEdge["relationship"],
          });
        }
      }
    });
    return {
      nodes: Array.from(nodesMap.values()),
      edges: Array.from(edgesMap.values()),
    };
  } finally {
    await session.close();
  }
}

// Calculate Downstream Impact (Blast Radius) via Multi-Hop Traversal
export async function getBlastRadius(startNodeId: string) {
  const driver = getCognoDriver();
  const session = driver.session();

  try {
    // Cypher path traversal: 1 to 5 hops downstream
    const result = await session.run(
      `
      MATCH path = (start {id: $startNodeId})-[*1..5]->(impacted)
      RETURN path
      `,
      { startNodeId },
    );

    const impactedNodeIds = new Set<string>();
    const impactedEdgeIds = new Set<string>();

    result.records.forEach((record) => {
      const path = record.get("path");
      path.segments.forEach((segment: PathSegment) => {
        if (segment.start?.properties?.id) {
          impactedNodeIds.add(segment.start.properties.id);
        }
        if (segment.end?.properties?.id) {
          impactedNodeIds.add(segment.end.properties.id);
        }

        // Fallback: Use relationship property ID or internal identity string
        const edgePropertyId = segment.relationship?.properties?.id;
        const edgeIdentity = segment.relationship?.identity?.toString();

        if (edgePropertyId) {
          impactedEdgeIds.add(edgePropertyId);
        } else if (edgeIdentity) {
          impactedEdgeIds.add(edgeIdentity);
        }
      });
    });

    return {
      startNodeId,
      impactedNodeIds: Array.from(impactedNodeIds),
      impactedEdgeIds: Array.from(impactedEdgeIds),
      totalImpactedCount: impactedNodeIds.size,
    };
  } finally {
    await session.close();
  }
}

// 1. Create Node & Relationship
export async function createNodeWithRelationship(params: CreateNodeParams) {
  const driver = getCognoDriver();
  const session = driver.session();

  try {
    //1. Create the base node using Cypher label interpolation

    const createNodeQuery = `
    CREATE (n:${params.label} {
    id: $id,
    name: $name,
    riskScore: $riskScore
    })
    RETURN n
    `;

    await session.run(createNodeQuery, {
      id: String(params.id),
      name: String(params.name),
      riskScore: Number(params.riskScore),
    });

    // 2. Safely attach relationship if target and relationship type are provided
    if (params.connectToNodeId && params.relationshipType) {
      const relType = params.relationshipType;
      const edgeId = `e-${Date.now()}`;
      const connectQuery = `
      MATCH (source {id: $sourceId}), (target {id: $targetId})
      CREATE (source)-[r:${relType} {id: $edgeId}]->(target)
      RETURN r
      `;

      await session.run(connectQuery, {
        sourceId: String(params.id),
        targetId: String(params.connectToNodeId),
        edgeId: String(edgeId),
      });
    }

    return { success: true, id: params.id };
  } finally {
    await session.close();
  }
}

// 2. Detach & Delete Node
export async function deleteNode(nodeId: string) {
  const driver = getCognoDriver();
  const session = driver.session();

  try {
    // DETACH DELETE removes the node AND all connected relationships cleanly
    await session.run(
      `
      MATCH (n {id: $nodeId})
      DETACH DELETE n
      `,
      { nodeId },
    );

    return { success: true, nodeId };
  } finally {
    await session.close();
  }
}

// Update existing Node properties
export async function updateNode(params: UpdateNodeParams) {
  const driver = getCognoDriver();
  const session = driver.session();

  try {
    // 1. Update labels and core node properties
    const createNodeQuery = `
      MATCH (n {id: $id})
      REMOVE n:Supplier:Component:Product:LogisticsHub
      SET n:${params.label},
          n.name = $name,
          n.riskScore = $riskScore
      RETURN n
    `;

    await session.run(createNodeQuery, {
      id: String(params.id),
      name: String(params.name),
      riskScore: Number(params.riskScore),
    });

    // 2. Re-wire relationships if target & type are supplied
    if (params.connectToNodeId && params.relationshipType) {
      // Delete existing outgoing edges from this node
      await session.run(
        `
        MATCH (source {id: $id})-[r]->()
        DELETE r
        `,
        { id: params.id },
      );

      // Create new relationship using the raw string variable for type
      const relType = params.relationshipType;
      const edgeId = `e-${Date.now()}`;

      await session.run(
        `
        MATCH (source {id: $sourceId}), (target {id: $targetId})
        CREATE (source)-[r:${relType} {id: $edgeId}]->(target)
        RETURN r
        `,
        {
          sourceId: String(params.id),
          targetId: String(params.connectToNodeId),
          edgeId: String(edgeId),
        },
      );
    }

    return { success: true, id: params.id };
  } finally {
    await session.close();
  }
}

export async function getNodeById(nodeId: string): Promise<NodeDetails | null> {
  const driver = getCognoDriver();
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (n {id: $nodeId})
      OPTIONAL MATCH (n)-[r]->(target)
      RETURN n, r, target
      LIMIT 1
      `,
      { nodeId },
    );

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0];
    const nodeN = record.get("n");
    const relR = record.get("r");
    const targetNode = record.get("target");

    if (!nodeN) return null;

    return {
      id: nodeN.properties.id,
      name: nodeN.properties.name,
      label: nodeN.labels[0] as GraphNode["label"],
      riskScore: Number(nodeN.properties.riskScore || 0),
      connectToNodeId: targetNode ? targetNode.properties.id : "",
      relationshipType: relR ? relR.type : "SUPPLIES",
    };
  } finally {
    await session.close();
  }
}
