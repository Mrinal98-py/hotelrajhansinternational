import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  console.log("Applying RoomBlock schema migration to Neon PostgreSQL...");

  const statements = [
    `ALTER TYPE "RoomStatus" ADD VALUE IF NOT EXISTS 'BLOCKED'`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RoomBlockType') THEN CREATE TYPE "RoomBlockType" AS ENUM ('MAINTENANCE', 'VIP_HOLD', 'DEEP_CLEANING', 'RENOVATION', 'OUT_OF_SERVICE', 'MANAGEMENT_BLOCK'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RoomBlockStatus') THEN CREATE TYPE "RoomBlockStatus" AS ENUM ('ACTIVE', 'RELEASED', 'CANCELLED'); END IF; END $$`,
    `CREATE TABLE IF NOT EXISTS "RoomBlock" (
      "id" TEXT NOT NULL,
      "physicalRoomId" TEXT NOT NULL,
      "startDate" TIMESTAMP(3) NOT NULL,
      "endDate" TIMESTAMP(3) NOT NULL,
      "reason" TEXT NOT NULL,
      "blockType" "RoomBlockType" NOT NULL DEFAULT 'MANAGEMENT_BLOCK',
      "status" "RoomBlockStatus" NOT NULL DEFAULT 'ACTIVE',
      "createdBy" TEXT,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "RoomBlock_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "RoomBlock_physicalRoomId_fkey" FOREIGN KEY ("physicalRoomId") REFERENCES "PhysicalRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS "RoomBlock_physicalRoomId_status_idx" ON "RoomBlock"("physicalRoomId", "status")`,
    `CREATE INDEX IF NOT EXISTS "RoomBlock_startDate_endDate_idx" ON "RoomBlock"("startDate", "endDate")`,
  ];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`[Success] Step ${i + 1}/${statements.length}`);
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        console.log(`[Already Exists] Step ${i + 1}/${statements.length}`);
      } else {
        console.error(`[Error] Step ${i + 1}:`, err);
        throw err;
      }
    }
  }

  console.log("RoomBlock migration completed successfully!");
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
