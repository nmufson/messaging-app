import { z } from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';
import { Profile } from './profile';

export const MessageType = z.enum(['TEXT', 'IMAGE']);
export type MessageType = z.infer<typeof MessageType>;

export const SendMessageInput = z.object({
  type: MessageType,
  content: z.string().nullable(),
  imageUrl: z.string().nullable(),
  sender: ObjectId,
  conversationId: ObjectId,
});
export type SendMessageInput = z.infer<typeof SendMessageInput>;

export const Message = z.object({
  type: MessageType,
  content: z.string().nullable(),
  imageUrl: z.string().nullable(),
  get sender() {
    return z.union([ObjectId, Profile]);
  },

  conversationId: ObjectId,

  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});
