import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type { User, Chat, Message } from '@prisma/client';

export * from '@prisma/client';
