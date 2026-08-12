import { NextResponse } from "next/server";
import { getCognoDriver } from "@/lib/db/cogno";

export async function GET() {
  const driver = getCognoDriver();
  const session = driver.session();

  try {
    // 1. Run a basic Cypher query to verify connectivity
    const result = await session.run(
      "RETURN 'Connected to CognoDB via Neo4j Driver!' AS message, timestamp() AS time",
    );

    const message = result.records[0].get("message");
    const time = result.records[0].get("time");

    return NextResponse.json({ success: true, message, time });
  } catch (error) {
    console.error("CognoDB connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    );
  } finally {
    // Always close the session to avoid connection leaks
    await session.close();
  }
}
