import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { runGraphSeed } from "@/lib/db/seedHelper";

async function main() {
  console.log("Seeding database via CLI script...");
  try {
    await runGraphSeed();
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed database:", error);
    process.exit(1);
  }
}

main();
