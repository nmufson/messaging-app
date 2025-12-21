import z from 'zod';
import { ChatActionType } from './action';
import { DateRange, DateTimeSchema, ObjectId } from './primitives';
import { ActionActivityDTO, ChatActivityDTO } from './activities';

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
