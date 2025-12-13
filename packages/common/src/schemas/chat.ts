import z from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';
import { MessageDTO, MessageWithSenderDTO } from './message';

export const ChatType = z.enum(['GROUP', 'DIRECT']);
export type ChatType = z.infer<typeof ChatType>;
// ? may need to separate ChatDetailDTO and ChatListItemDTO

export const UpdateChatInput = z.object({
  id: ObjectId,
  name: z.string().nullish(),
  groupPictureUrl: z.string().nullish(),
});
export type UpdateChatInput = z.infer<typeof UpdateChatInput>;

export const ChatActionType = z.enum([
  'CHAT_CREATED',
  'MEMBER_ADDED',
  'MEMBER_REMOVED',
  'MEMBER_LEFT',
  'NAME_CHANGED',
  'PICTURE_CHANGED',
]);
export type ChatActionType = z.infer<typeof ChatActionType>;

export const CHAT_UPDATE_ACTIONS = {
  name: 'NAME_CHANGED',
  groupPictureUrl: 'PICTURE_CHANGED',
} as const satisfies Record<keyof Omit<UpdateChatInput, 'id'>, ChatActionType>;

export const IChatAction = z.object({
  id: ObjectId,
  chatId: ObjectId,
  actionType: ChatActionType,
  actorId: ObjectId,
  targetId: ObjectId.nullable(),
  createdAt: z.date(),
});
export type IChatAction = z.infer<typeof IChatAction>;

export const ChatActionDTO = IChatAction.extend({
  createdAt: DateTimeSchema,
});
export type ChatActionDTO = z.infer<typeof ChatActionDTO>;

export const ActivityProfileDTO = z.object({
  id: ObjectId,
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().nullable(),
});
export type ActivityProfileDTO = z.infer<typeof ActivityProfileDTO>;

export const MessageActivityDTO = MessageDTO.extend({
  activityType: z.literal('message'),
});
export type MessageActivityDTO = z.infer<typeof MessageActivityDTO>;

export const ActionActivityDTO = ChatActionDTO.extend({
  activityType: z.literal('action'),
});
export type ActionActivityDTO = z.infer<typeof ActionActivityDTO>;

export const ChatActivityDTO = z.discriminatedUnion('activityType', [
  MessageActivityDTO,
  ActionActivityDTO,
]);
export type ChatActivityDTO = z.infer<typeof ChatActivityDTO>;

export const ChatDTO = z.object({
  id: ObjectId,
  type: ChatType,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  participants: z
    .object({
      id: ObjectId,
      firstName: z.string(),
      lastName: z.string(),
      avatarUrl: z.string().nullable(),
      isOnline: z.boolean().nullish(),
      lastOnline: DateTimeSchema.nullish(),
    })
    .array(),
  activityProfiles: SenderDTO.array(),
  messages: MessageDTO.array(),
  actions: ChatActionDTO.array(),
  activities: ChatActivityDTO.array(),
  // Group-specific fields
  name: z.string().nullable(),
  groupPictureUrl: z.string().nullable(),
  creatorId: ObjectId,
});
export type ChatDTO = z.infer<typeof ChatDTO>;

export const ChatPreviewDTO = ChatDTO.omit({ senders: true }).extend({
  messages: MessageWithSenderDTO.array(),
});
export type ChatPreviewDTO = z.infer<typeof ChatPreviewDTO>;

export const ChatInfoDTO = ChatDTO.omit({
  messages: true,
  senders: true,
  activities: true,
});
export type ChatInfoDTO = z.infer<typeof ChatInfoDTO>;

export const ChatDetailDTO = ChatDTO.extend({});

export const ChatListDTO = z.object({
  id: ObjectId,
  type: ChatType,
  name: z.string().nullable(),
  groupPictureUrl: z.string().nullable(),
  participants: z.array(
    z.object({
      id: ObjectId,
      firstName: z.string(),
      lastName: z.string(),
      avatarUrl: z.string().nullable(),
    })
  ),
});
export type ChatListDTO = z.infer<typeof ChatListDTO>;

// export const ChatDetailDTO = ChatDTO.extend({
//   messages: Message.array(),
// });
// export type ChatDetailDTO = z.infer<typeof ChatDetailDTO>;
