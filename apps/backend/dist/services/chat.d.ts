import { Chat } from '@repo/db';
import { PrismaClient } from '@repo/db';
import { ObjectId } from '@common/src/schemas/primitives';
export declare const findOrCreateDirectChat: (prisma: PrismaClient, senderId: ObjectId, receiverId: ObjectId) => Promise<{
    chat: Chat;
    isNewChat: boolean;
}>;
