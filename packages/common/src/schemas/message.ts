import { z } from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';
import { createDecipheriv } from 'crypto';
import { create } from 'domain';

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

export const MessageSearchResultDTO = z.object({
  id: ObjectId,
  content: z.string(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  sender: z.object({
    id: ObjectId,
    firstName: z.string(),
    lastName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
});
export type MessageSearchResultDTO = z.infer<typeof MessageSearchResultDTO>;

export const ListPhotoMessageDTO = z.object({
  id: ObjectId,
  imageUrl: z.string(),
  createdAt: DateTimeSchema,
  senderId: ObjectId,
});
export type ListPhotoMessageDTO = z.infer<typeof ListPhotoMessageDTO>;
