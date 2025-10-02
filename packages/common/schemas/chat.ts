import { Dir } from 'fs';
import z from 'zod';
import { Message } from './message';
import { Profile } from './profile';
import { DateTimeSchema, ObjectId } from './primitives';

export const ChatType = z.enum(['GROUP', 'DIRECT']);

const BaseChat = z.object({
  id: ObjectId,
  messages: Message.array(),
  get participants() {
    return Profile.array();
  },
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});

const DirectChat = BaseChat.extend({
  type: ChatType.enum.DIRECT,
});

const GroupChat = BaseChat.extend({
  type: ChatType.enum.GROUP,
  name: z.string().nullable(),
  groupPictureUrl: z.string().nullable(),
  creator: z.union([ObjectId, Profile]),
});

export const Chat = z.discriminatedUnion('type', [DirectChat, GroupChat]);
export type Chat = z.infer<typeof Chat>;

const BaseChatDTO = z.object({
  id: ObjectId,
  type: ChatType,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),

  participants: z.array(
    z.object({
      id: ObjectId,
      firstName: z.string(),
      lastName: z.string(),
      profilePictureUrl: z.string().optional(),
    })
  ),

  lastMessage: z
    .object({
      content: z.string(),
      sender: z.object({
        firstName: z.string(),
        lastName: z.string(),
      }),
    })
    .optional(),
});

const DirectChatDTO = BaseChatDTO.extend({
  type: z.literal('DIRECT'),
});

const GroupChatDTO = BaseChatDTO.extend({
  type: z.literal('GROUP'),
  name: z.string().nullable(),
  groupPictureUrl: z.string().nullable(),
  creator: z.object({
    id: ObjectId,
    firstName: z.string(),
    lastName: z.string(),
  }),
});

export const ChatDTO = z.discriminatedUnion('type', [
  DirectChatDTO,
  GroupChatDTO,
]);
export type ChatDTO = z.infer<typeof ChatDTO>;

export const DirectChatDetailDTO = DirectChatDTO.extend({
  messages: Message.array(),
});

export const GroupChatDetailDTO = GroupChatDTO.extend({
  messages: Message.array(),
});

export const ChatDetailDTO = z.discriminatedUnion('type', [
  DirectChatDetailDTO,
  GroupChatDetailDTO,
]);
export type ChatDetailDTO = z.infer<typeof ChatDetailDTO>;
