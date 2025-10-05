import { PrismaClient, Chat } from '@db';
import { ObjectId } from '@common/schemas/primitives';

declare const findOrCreateDirectChat: (prisma: PrismaClient, senderId: ObjectId, receiverId: ObjectId) => Promise<{
    chat: Chat;
    isNewChat: boolean;
}>;

export { findOrCreateDirectChat };
