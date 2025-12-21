import z from 'zod';
import { DateRange, DateTimeSchema, ObjectId } from './primitives';
import { IMessage, MessageDTO, MessageWithSenderDTO } from './message';
import {
  ChatActionDTO,
  ChatActionType,
  ChatActionWithActorDTO,
  IChatAction,
} from './action';
export const CHAT_UPDATE_ACTIONS = {
  name: 'NAME_CHANGED',
  groupPictureUrl: 'PICTURE_CHANGED',
} as const satisfies Record<keyof Omit<UpdateChatInput, 'id'>, ChatActionType>;

export const ChatType = z.enum(['GROUP', 'DIRECT']);
export type ChatType = z.infer<typeof ChatType>;

export const UpdateChatInput = z.object({
  id: ObjectId,
  name: z.string().nullish(),
  groupPictureUrl: z.string().nullish(),
});
export type UpdateChatInput = z.infer<typeof UpdateChatInput>;

export const ActivityType = z.enum(['message', 'action']);
export type ActivityType = z.infer<typeof ActivityType>;

export const ParticipationStatus = z.enum(['MEMBER', 'LEFT', 'REMOVED']);
export type ParticipationStatus = z.infer<typeof ParticipationStatus>;

export const IMessageActivity = IMessage.extend({
  activityType: z.literal('message'),
});
export type IMessageActivity = z.infer<typeof IMessageActivity>;
export const IChatActionActivity = IChatAction.extend({
  activityType: z.literal('action'),
});
export type IChatActionActivity = z.infer<typeof IChatActionActivity>;
export const IChatActivity = z.discriminatedUnion('activityType', [
  IMessageActivity,
  IChatActionActivity,
]);
export type IChatActivity = z.infer<typeof IChatActivity>;

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

export const ChatParticipantDTO = z.object({
  lastViewedAt: DateTimeSchema.nullish(),
  unreadActivities: z.number().int().nonnegative(),
  profile: z.object({
    id: ObjectId,
    firstName: z.string(),
    lastName: z.string(),
    avatarUrl: z.string().nullable(),
    isOnline: z.boolean().nullish(),
    lastOnline: DateTimeSchema.nullish(),
  }),
});
export type ChatParticipantDTO = z.infer<typeof ChatParticipantDTO>;

export const ChatDTO = z.object({
  id: ObjectId,
  type: ChatType,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  participants: ChatParticipantDTO.array(),
  activities: ChatActivityDTO.array(),
  name: z.string().nullable(),
  groupPictureUrl: z.string().nullable(),
  creatorId: ObjectId,
  dateRange: DateRange.optional(),
});
export type ChatDTO = z.infer<typeof ChatDTO>;

// export const ChatPreviewDTO = ChatDTO.omit({
//   activities: true,
// }).extend({
//   messages: MessageWithSenderDTO.array(),
//   actions: ChatActionWithActorDTO.array(),
// });
// export type ChatPreviewDTO = z.infer<typeof ChatPreviewDTO>;

export const ChatInfoDTO = ChatDTO.omit({
  activities: true,
});
export type ChatInfoDTO = z.infer<typeof ChatInfoDTO>;

export const ChatDetailDTO = ChatDTO.extend({});

export const ChatListDTO = z.object({
  id: ObjectId,
  type: ChatType,
  name: z.string().nullable(),
  groupPictureUrl: z.string().nullable(),
  participants: z
    .object({
      profile: z.object({
        id: ObjectId,
        firstName: z.string(),
        lastName: z.string(),
        avatarUrl: z.string().nullable(),
      }),
    })
    .array(),
});
export type ChatListDTO = z.infer<typeof ChatListDTO>;

export const ActionOutputDTO = z.object({
  updatedChat: ChatInfoDTO,
  newActionActivity: ActionActivityDTO,
});
export type ActionOutputDTO = z.infer<typeof ActionOutputDTO>;
