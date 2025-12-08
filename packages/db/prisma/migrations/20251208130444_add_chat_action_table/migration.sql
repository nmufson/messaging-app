-- CreateEnum
CREATE TYPE "ChatActionType" AS ENUM ('MEMBER_ADDED', 'MEMBER_REMOVED', 'MEMBER_LEFT', 'NAME_CHANGED', 'PICTURE_CHANGED', 'CHAT_CREATED');

-- CreateTable
CREATE TABLE "ChatAction" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "actionType" "ChatActionType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatAction" ADD CONSTRAINT "ChatAction_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatAction" ADD CONSTRAINT "ChatAction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatAction" ADD CONSTRAINT "ChatAction_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
