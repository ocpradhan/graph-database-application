import { NextResponse } from "next/server";
import { getCognoDriver } from "@/lib/db/cogno";
import { z } from "zod";

const createRelationshipSchema = z.object({
  sourceId: z.string(),
  targetId: z.string(),
  relationshipType: z
    .enum(["SUPPLIES", "PART_OF", "SHIPPED_VIA"])
    .default("SUPPLIES"),
});

export async function POST(request: Request) {
  const driver = getCognoDriver();
  const session = driver.session();

  try {
    const body = await request.json();
    const validated = createRelationshipSchema.parse(body);

    const edgeId = `e-${Date.now()}`;
    const relType = validated.relationshipType;

    // OpenCypher query to connect source and target nodes
    const query = `
        MATCH (source {id: $sourceId}), (target {id: $targetId})
        CREATE (source)-[r:${relType} {id: $edgeId}]->(target)
    `;

    await session.run(query, {
      sourceId: String(validated.sourceId),
      targetId: String(validated.targetId),
      edgeId: String(edgeId),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Relationship created successfully",
        id: edgeId,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      { status: 400 },
    );
  } finally {
    await session.close();
  }
}
