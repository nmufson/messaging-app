import { z } from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';
import { createDecipheriv } from 'crypto';
import { create } from 'domain';
import { ChatDTO, ChatType } from './chat';
import { id } from 'zod/v4/locales';

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

export const MessageWithSenderDTO = MessageDTO.omit({ senderId: true }).extend({
  sender: z.object({
    id: ObjectId,
    firstName: z.string(),
    lastName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
});
export type MessageWithSenderDTO = z.infer<typeof MessageWithSenderDTO>;

export const TextMessageSearchResultDTO = MessageWithSenderDTO.extend({
  chat: z.object({
    id: ObjectId,
    name: z.string().nullish(),
    participants: z.array(
      z.object({
        id: ObjectId,
        firstName: z.string(),
        lastName: z.string(),
      })
    ),
  }),
});
export type TextMessageSearchResultDTO = z.infer<
  typeof TextMessageSearchResultDTO
>;

export const PhotoMessageSearchResultDTO = MessageWithSenderDTO.omit({
  content: true,
}).extend({
  type: z.literal('IMAGE'),
  imageUrl: z.string(),
});
export type PhotoMessageSearchResultDTO = z.infer<
  typeof PhotoMessageSearchResultDTO
>;
