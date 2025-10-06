import * as _db from '@db';
import { PrismaClient } from '@db';
import { SendMessageInput } from '@common/schemas/message';

declare const sendMessage: (prisma: PrismaClient, params: SendMessageInput) => Promise<{
    id: string;
    type: _db.$Enums.MessageType;
    createdAt: Date;
    chatId: string;
    updatedAt: Date | null;
    content: string | null;
    imageUrl: string | null;
    senderId: string;
}>;

export { sendMessage };
