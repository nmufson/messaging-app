/*
  Warnings:

  - You are about to drop the column `departedAt` on the `ChatParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ChatParticipant` table. All the data in the column will be lost.
  - Made the column `content` on table `ChatAction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ChatAction" ALTER COLUMN "content" SET NOT NULL;

-- AlterTable
ALTER TABLE "ChatParticipant" DROP COLUMN "departedAt",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "ParticipationStatus";
