// Graph traversal & blast radius API
import { NextResponse } from "next/server";
import { getBlastRadius } from "@/lib/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nodeId = searchParams.get("nodeId");

  if (!nodeId) {
    return NextResponse.json(
      { message: false, error: "nodeId query parameter is required" },
      { status: 400 },
    );
  }

  try {
    const analytics = await getBlastRadius(nodeId);
    return NextResponse.json({ message: "success", analytics });
  } catch (error) {
    return NextResponse.json(
      { message: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
