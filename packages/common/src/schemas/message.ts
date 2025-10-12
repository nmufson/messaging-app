import { z } from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';

export const MessageType = z.enum(['TEXT', 'IMAGE']);
export type MessageType = z.infer<typeof MessageType>;

export const SendMessageInput = z.object({
  type: MessageType,
  content: z.string().nullable(),
  imageUrl: z.string().nullable(),
  sender: ObjectId,
  chatId: ObjectId,
});
export type SendMessageInput = z.infer<typeof SendMessageInput>;

export const MessageDTO = z.object({
  id: ObjectId,
  type: MessageType,
  content: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  senderId: ObjectId,
});
export type MessageDTO = z.infer<typeof MessageDTO>;
