import { NextResponse } from "next/server";
import { createNodeWithRelationship } from "@/lib/db/queries";
import { z } from "zod";
import { formatZodErrors } from "@/lib/utils";

export const createNodeSchema = z.object({
  label: z.enum(["Supplier", "Component", "Product", "LogisticsHub"]),
  name: z.string().trim().min(1, "Entity Name is Required"),
  riskScore: z.coerce
    .number({ error: "Risk Score must be a valid number" })
    .min(0, "Risk Score must be at least 0")
    .max(100, "Risk Score cannot exceed 100")
    .nullable(),
  connectToNodeId: z.string().optional(),
  relationshipType: z
    .enum(["SUPPLIES", "PART_OF", "SHIPPED_VIA"])
    .optional()
    .nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createNodeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: false,
          errors: formatZodErrors(result.error),
        },
        { status: 400 },
      );
    }

    const validated = result.data;
    const newNodeId = `node-${Date.now()}`;

    const nodeResult = await createNodeWithRelationship({
      id: newNodeId,
      name: validated.name,
      label: validated.label,
      riskScore: Number(validated.riskScore),
      connectToNodeId: validated.connectToNodeId || undefined,
      relationshipType: validated.relationshipType || undefined,
    });

    return NextResponse.json(
      {
        message: "success",
        data: nodeResult,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: false,
        error: (error as Error).message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
