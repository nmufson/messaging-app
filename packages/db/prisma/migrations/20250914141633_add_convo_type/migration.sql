/*
  Warnings:

  - Added the required column `type` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('DIRECT', 'GROUP');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "type" "ConversationType" NOT NULL;
