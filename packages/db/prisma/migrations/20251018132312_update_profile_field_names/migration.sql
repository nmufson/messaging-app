/*
  Warnings:

  - You are about to drop the column `headerPictureUrl` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `profilePictureUrl` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "headerPictureUrl",
DROP COLUMN "profilePictureUrl",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "headerUrl" TEXT;
