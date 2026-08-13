import { NextResponse } from "next/server";
import { runGraphSeed } from "@/lib/db/seedHelper";

export async function POST() {
  try {
    await runGraphSeed();
    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
