/*
  Warnings:

  - You are about to alter the column `bio` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(250)`.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "title" VARCHAR(50),
ALTER COLUMN "bio" SET DATA TYPE VARCHAR(250);
