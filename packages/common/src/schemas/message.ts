import { z } from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';

export const MessageType = z.enum(['TEXT', 'IMAGE', 'REACTION']);
export type MessageType = z.infer<typeof MessageType>;

export const ReactionEmoji = z.enum([
  '\\u{1F602}', // laughing
  '\\u{1F44D}', // thumbs up
  '\\u{1F44E}', // thumbs down
  '\\u{2764}\\u{FE0F}', // heart
  '\\u{2757}', // exclamation
]);
export type ReactionEmoji = z.infer<typeof ReactionEmoji>;

export const SendMessageInput = z.object({
  type: MessageType,
  content: z.string().nullable(),
  imageUrl: z.string().nullable(),
  sender: ObjectId,
  chatId: ObjectId,
});
export type SendMessageInput = z.infer<typeof SendMessageInput>;

export const IMessage = z.object({
  id: ObjectId,
  type: MessageType,
  content: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  senderId: ObjectId,
  replyToId: ObjectId.nullish(), // other message that this message is replying to
});
export type IMessage = z.infer<typeof IMessage>;

export const MessageDTO = IMessage.extend({
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
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
  chatId: ObjectId,
  type: z.literal('IMAGE'),
  imageUrl: z.string(),
});
export type PhotoMessageSearchResultDTO = z.infer<
  typeof PhotoMessageSearchResultDTO
>;
