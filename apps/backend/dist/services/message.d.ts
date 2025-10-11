import { SendMessageInput } from '@common/src/schemas/message';
import { PrismaClient } from '@repo/db';
export declare const sendMessage: (prisma: PrismaClient, params: SendMessageInput) => Promise<{
    id: string;
    createdAt: Date;
    chatId: string;
    type: import("@repo/db").$Enums.MessageType;
    updatedAt: Date | null;
    content: string | null;
    imageUrl: string | null;
    senderId: string;
}>;
