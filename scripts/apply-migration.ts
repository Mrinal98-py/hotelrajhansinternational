import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function run() {
  console.log("Applying safe schema migration to Neon PostgreSQL...");

  const sql = fs.readFileSync(path.join(__dirname, "../prisma/migration_preview.sql"), "utf-8");

  // Split statements cleanly by semicolon and strip comments
  const statements = sql
    .split(";")
    .map((s) => s.replace(/--.*$/gm, "").trim())
    .filter((s) => s.length > 0);

  console.log(`Total statements to execute: ${statements.length}`);

  let successCount = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await prisma.$executeRawUnsafe(stmt);
      successCount++;
    } catch (err: any) {
      // If error is about already existing type or column, log warning but continue
      if (
        err.message?.includes("already exists") ||
        err.message?.includes("duplicate key")
      ) {
        console.warn(`[Skip Existing] Step ${i + 1}: ${err.message.split("\n")[0]}`);
      } else {
        console.error(`[Error] Step ${i + 1}:`, stmt);
        console.error(err);
        throw err;
      }
    }
  }

  console.log(`Successfully applied migration! (${successCount}/${statements.length} statements)`);
}

run()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("Migration failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
