import { NextResponse } from "next/server";
import { getGraphData } from "@/lib/db/queries";

export async function GET() {
  try {
    const data = await getGraphData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
