/*
  Warnings:

  - You are about to drop the column `role` on the `ChatParticipant` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('MEMBER', 'LEFT', 'REMOVED');

-- AlterTable
ALTER TABLE "ChatParticipant" DROP COLUMN "role",
ADD COLUMN     "departedAt" TIMESTAMP(3),
ADD COLUMN     "status" "ParticipationStatus" NOT NULL DEFAULT 'MEMBER';

-- DropEnum
DROP TYPE "ChatRole";
