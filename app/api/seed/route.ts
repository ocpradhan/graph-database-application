import { NextResponse } from "next/server";
import { runGraphSeed } from "@/lib/db/seedHelper";

export async function POST() {
  try {
    const result = await runGraphSeed();

    return NextResponse.json({
      message: "success",
      data: result ?? { status: "seeded" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: false,
        error: (error as Error).message || "Failed to seed database",
      },
      { status: 500 },
    );
  }
}
