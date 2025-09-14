import { z } from 'zod';
import { DateTimeSchema } from './conversation';
import { Profile } from './profile';

export const MessageType = z.enum(['TEXT', 'IMAGE']);

export const Message = z.object({
  type: MessageType,
  content: z.string().nullable(),
  imageUrl: z.string().nullable(),
  get sender() {
    return z.union([z.string(), Profile]);
  },

  conversationId: z.string(),

  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});
