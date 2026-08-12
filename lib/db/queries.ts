// Data access layer (DAL) for graph operations
import { getCognoDriver } from "./cogno";
import { GraphData, GraphNode, GraphEdge } from "@/types/graph";

// Seed initial database graph
export async function seedDatabase() {
  const driver = getCognoDriver();
  const session = driver.session();

  try {
    await session.run(`
        MATCH (n) DETACH DELETE n;
        `);

    await session.run(`
        CREATE (s1:Supplier {id: 'sup-1', name: 'Acme Semi', riskScore: 85})
        CREATE (s2:Supplier {id: 'sup-2', name: 'Global Logistics', riskScore:20})
        CREATE (c1:Component {id: 'comp-1', name: 'Microchip A', riskScore:70})
        CREATE (p1:Product {id: 'prod-1', name: 'Smart Phone X', riskScore:40})
        CREATE (h1:LogisticsHub {id: 'hub-1', name: 'Central Depot', riskScore:10})

        CREATE (s1)-[:SUPPLIES {id: 'e1'}]->(c1)
        CREATE (c1)-[:PART_OF {id: 'e2'}]->(p1)
        CREATE (p1)-[:SHIPPED_VIA {id: 'e3'}]->(h1)
        `);

    return { success: true };
  } finally {
    await session.close();
  }
}

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
