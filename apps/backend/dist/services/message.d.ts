import { SendMessageInput } from '@common/src/schemas/message';
import { PrismaClient } from '@db';
export declare const sendMessage: (prisma: PrismaClient, params: SendMessageInput) => Promise<any>;
