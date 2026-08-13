import { NextResponse } from "next/server";
import { deleteNode, updateNode, getNodeById } from "@/lib/db/queries";
import { z } from "zod";
import { formatZodErrors } from "@/lib/utils";
import { createNodeSchema } from "../route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. AWAIT the params object first!
  const resolvedParams = await params;

  try {
    if (!resolvedParams?.id) {
      return NextResponse.json(
        {
          error: "Node ID is required",
        },
        { status: 400 },
      );
    }

    const nodeId = decodeURIComponent(resolvedParams.id);
    const nodeData = await getNodeById(nodeId);

    if (!nodeData) {
      return NextResponse.json(
        {
          error: "Node not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(nodeData);
  } catch (error) {
    console.error(`Failed to fetch node for ${resolvedParams.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch node details" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: nodeId } = await params;
  const body = await request.json();

  try {
    const result = createNodeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          errors: formatZodErrors(result.error),
        },
        { status: 400 },
      );
    }

    const validated = result.data;

    await updateNode({
      id: nodeId,
      name: validated.name,
      label: validated.label,
      riskScore: Number(validated.riskScore),
      connectToNodeId: validated.connectToNodeId || undefined,
      relationshipType: validated.relationshipType || undefined,
    });
    return NextResponse.json({
      success: true,
      message: `Node ${nodeId} updated`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: nodeId } = await params;

  if (!nodeId) {
    return NextResponse.json({ error: "Node ID is required" }, { status: 400 });
  }

  try {
    await deleteNode(nodeId);
    return NextResponse.json({
      success: true,
      message: `Node ${nodeId} deleted`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
