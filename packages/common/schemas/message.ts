import { z } from 'zod';
import { DateTimeSchema } from './conversation';

export const MessageType = z.enum(['TEXT', 'IMAGE']);

export const Message = z.object({
  type: MessageType,
  content: z.string().nullable(),
  imageUrl: z.string().nullable(),
  senderId: z.string(),
  conversationId: z.string(),

  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});
