-- CreateEnum
CREATE TYPE "TransferReason" AS ENUM ('GUEST_REQUEST', 'MAINTENANCE', 'UPGRADE', 'OPERATIONAL', 'OTHER');

-- AlterEnum
ALTER TYPE "FolioItemType" ADD VALUE 'REVERSAL';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "actualCheckInAt" TIMESTAMP(3),
ADD COLUMN     "actualCheckOutAt" TIMESTAMP(3),
ADD COLUMN     "scheduledCheckIn" TIMESTAMP(3),
ADD COLUMN     "scheduledCheckOut" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RoomBlock" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "RoomTransfer" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fromPhysicalRoomId" TEXT NOT NULL,
    "toPhysicalRoomId" TEXT NOT NULL,
    "reason" "TransferReason" NOT NULL DEFAULT 'GUEST_REQUEST',
    "notes" TEXT,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomTransfer_bookingId_idx" ON "RoomTransfer"("bookingId");

-- CreateIndex
CREATE INDEX "RoomTransfer_fromPhysicalRoomId_idx" ON "RoomTransfer"("fromPhysicalRoomId");

-- CreateIndex
CREATE INDEX "RoomTransfer_toPhysicalRoomId_idx" ON "RoomTransfer"("toPhysicalRoomId");

-- AddForeignKey
ALTER TABLE "RoomTransfer" ADD CONSTRAINT "RoomTransfer_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomTransfer" ADD CONSTRAINT "RoomTransfer_fromPhysicalRoomId_fkey" FOREIGN KEY ("fromPhysicalRoomId") REFERENCES "PhysicalRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomTransfer" ADD CONSTRAINT "RoomTransfer_toPhysicalRoomId_fkey" FOREIGN KEY ("toPhysicalRoomId") REFERENCES "PhysicalRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
