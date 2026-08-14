import { NextResponse } from "next/server";
import { deleteNode, updateNode, getNodeById } from "@/lib/db/queries";
import { formatZodErrors } from "@/lib/utils";
import { createNodeSchema } from "../route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;

  try {
    if (!resolvedParams?.id) {
      return NextResponse.json(
        {
          message: false,
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
          message: false,
          error: "Node not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "success",
      data: nodeData,
    });
  } catch (error) {
    console.error(`Failed to fetch node for ${resolvedParams?.id}:`, error);
    return NextResponse.json(
      {
        message: false,
        error: (error as Error).message || "Failed to fetch node details",
      },
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
          message: false,
          errors: formatZodErrors(result.error),
        },
        { status: 400 },
      );
    }

    const validated = result.data;

    const updatedNode = await updateNode({
      id: nodeId,
      name: validated.name,
      label: validated.label,
      riskScore: Number(validated.riskScore),
      connectToNodeId: validated.connectToNodeId || undefined,
      relationshipType: validated.relationshipType || undefined,
    });

    return NextResponse.json({
      message: "success",
      data: updatedNode,
    });
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  const nodeId = resolvedParams?.id;

  if (!nodeId) {
    return NextResponse.json(
      {
        message: false,
        error: "Node ID is required",
      },
      { status: 400 },
    );
  }

  try {
    const decodedId = decodeURIComponent(nodeId);
    await deleteNode(decodedId);

    return NextResponse.json({
      message: "success",
      data: { id: decodedId },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: false,
        error: (error as Error).message || `Failed to delete node ${nodeId}`,
      },
      { status: 500 },
    );
  }
}
