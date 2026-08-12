import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/db/queries";

export async function GET() {
  try {
    await seedDatabase();
    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    await seedDatabase();
    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
