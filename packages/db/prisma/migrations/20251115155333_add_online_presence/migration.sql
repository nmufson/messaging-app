-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastOnline" TIMESTAMP(3);
