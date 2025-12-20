/*
  Warnings:

  - You are about to drop the `_ChatParticipants` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('MEMBER');

-- DropForeignKey
ALTER TABLE "_ChatParticipants" DROP CONSTRAINT "_ChatParticipants_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatParticipants" DROP CONSTRAINT "_ChatParticipants_B_fkey";

-- DropTable
DROP TABLE "_ChatParticipants";

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastViewedAt" TIMESTAMP(3),
    "unreadActivities" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_chatId_profileId_key" ON "ChatParticipant"("chatId", "profileId");

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
