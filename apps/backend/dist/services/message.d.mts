import * as _db from '@db';
import { PrismaClient } from '@db';
import { SendMessageInput } from '@common/schemas/message';

declare const sendMessage: (prisma: PrismaClient, params: SendMessageInput) => Promise<{
    id: string;
    createdAt: Date;
    type: _db.$Enums.MessageType;
    updatedAt: Date | null;
    content: string | null;
    chatId: string;
    imageUrl: string | null;
    senderId: string;
}>;

export { sendMessage };
