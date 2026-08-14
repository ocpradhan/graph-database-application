# Supply Chain Resilience Tracker

> An interactive graph database application built with **CognoDB**, **Next.js**, and **TypeScript** to model multi-tier supply chain dependencies and simulate systemic disruption impacts in real time.

---

## Submission Links

- **Hosted Application Demo:** [REPLACE_WITH_YOUR_HOSTED_APP_URL]
- **Screen Recording Video:** [REPLACE_WITH_YOUR_LOOM_OR_DRIVE_LINK]
- **GitHub Repository:** [REPLACE_WITH_YOUR_GITHUB_REPO_URL]

---

## Tech Stack

- **Database:** CognoDB (OpenCypher over Bolt protocol via official Neo4j Driver)
- **Framework:** Next.js (App Router, React 19, TypeScript)
- **Styling & UI:** Tailwind CSS, shadcn/ui, Lucide Icons, Sonner (Toasts)
- **Graph Canvas:** React Flow (`@xyflow/react`)
- **Validation & Schema:** Zod

---

## Graph DB vs Relational DB Justification

This application relies on multi-hop connectivity queries to compute downstream blast radiuses when a vendor or hub experiences an outage.

In a relational database (RDBMS), finding all affected end-products from a tier-3 supplier requires recursive `WITH RECURSIVE` queries or complex `JOIN` operations across junction tables. These queries suffer from exponential performance degradation as graph depth and data volume scale.

CognoDB utilizes **index-free adjacency**, storing relationships as direct physical pointers. Traversing relationships operates in $O(1)$ constant time per relationship hop, ensuring fast performance regardless of network complexity. Furthermore, the graph model allows adding or mutating entity labels (`Supplier`, `Component`, `Product`, `LogisticsHub`) or relationship types (`SUPPLIES`, `PART_OF`, `SHIPPED_VIA`) dynamically without database migration scripts.

---

## 📐 Graph Data Model

The application models nodes representing critical network entities and directed, typed relationships representing operational dependencies.

### Node Labels & Properties

- `Supplier`: `id`, `name`, `label`, `riskScore`
- `Component`: `id`, `name`, `label`, `riskScore`
- `Product`: `id`, `name`, `label`, `riskScore`
- `LogisticsHub`: `id`, `name`, `label`, `riskScore`

### Relationship Types

- `(:Supplier)-[:SUPPLIES]->(:Component)`
- `(:Component)-[:PART_OF]->(:Product)`
- `(:LogisticsHub)-[:SHIPPED_VIA]->(:Product)`

### Model Diagram

```text
 (Supplier) ----[ SUPPLIES ]----> (Component) ----[ PART_OF ]----> (Product)
     |                                                                 ^
     |                                                                 |
     +--------------------[ SHIPPED_VIA ]------------------------------+
```

## 🛠️ Main Cypher Queries Explained

All Cypher queries in this application are parameterized and executed via the official Neo4j driver over the Bolt protocol to ensure security and prevent Cypher injection vulnerabilities.

---

### 1. Multi-Hop Blast Radius Traversal (`getBlastRadius`)

Traverses variable-length downstream paths from 1 up to 5 hops deep from a target entity. This is used by the inspector panel to calculate all downstream entities impacted by a vendor or component disruption:

```cypher
MATCH path = (start {id: $startNodeId})-[*1..5]->(impacted)
RETURN path
```

### 2. Full Graph Hydration (`getGraphData`)

Retrieves all nodes and optional direct downstream relationships in a single query to populate the interactive graph canvas:

```cypher
MATCH (n)
OPTIONAL MATCH (n)-[r]->(m)
RETURN n, r, m
```

### 3. Fetch Entity Details by ID (`getNodeById`)

```cypher
MATCH (n {id: $nodeId})
OPTIONAL MATCH (n)-[r]->(target)
RETURN n, r, target
LIMIT 1
```

### 4. Creating Nodes & Dynamic Relationships(`createNodeWithRelationship`)

## Step 1: Create Base Entity node

```cypher
CREATE (n:${params.label} {
  id: $id,
  name: $name,
  riskScore: $riskScore
})
RETURN n;
```

## Step 2: Attach downstream relationship (if target provided)

```cypher
  MATCH (source {id: $sourceId}), (target {id: $targetId})
   CREATE (source)-[r:${relType} {id: $edgeId}]->(target)
   RETURN r
```

### 5. Connecting Edges Directly (`createRelationship`)

```cypher
MATCH (source {id: $sourceId}), (target {id:$targetId})
CREATE (source)-[r:${relType} {id:$edgeId}]->(target)
```

### 6. Dynamic Label & Relationship Rewiring (`updateNode`)

## Step 1: Create Base Entity node

```cypher
MATCH (n {id: $id})
REMOVE n:Supplier:Component:Product:LogisticsHub
SET n:${params.label},
    n.name = $name,
    n.riskScore = $riskScore
RETURN n;
```

## Step 2: Delete existing outgoing edges

```cypher
MATCH (source {id: $id})-[r]->()
DELETE r;
```

## Step 3: Wire new relationship

```cypher
MATCH (source {id: $sourceId}), (target {id:$targetId})
CREATE (source)-[r:${relType} {id:$edgeId}]->(target)
RETURN r;
```

### 7. Detach Delete(`deleteNode`)

```cypher
MATCH (n {id: $nodeId})
DETACH DELETE n
```
