import z from 'zod';
import { ChatActionType } from './action';
import { DateRange, DateTimeSchema, ObjectId } from './primitives';
import { ActionActivityDTO, ChatActivityDTO } from './activities';
import { BaseProfileDTO, IBaseProfile } from './profile';

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

export const IChatParticipant = z.object({
  lastViewedAt: z.date().nullish(),
  unreadActivities: z.number().int().nonnegative(),
  profile: IBaseProfile,
});
export type IChatParticipant = z.infer<typeof IChatParticipant>;

export const ChatParticipantDTO = IChatParticipant.extend({
  lastViewedAt: DateTimeSchema.nullish(),
  profile: BaseProfileDTO,
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

export const IChatListItem = z.object({
  id: ObjectId,
  type: ChatType,
  name: z.string().nullable(),
  groupPictureUrl: z.string().nullable(),
  participants: IChatParticipant.array(),
});
export type IChatListItem = z.infer<typeof IChatListItem>;

export const ChatListItemDTO = IChatListItem.extend({
  participants: ChatParticipantDTO.array(),
});
export type ChatListItemDTO = z.infer<typeof ChatListItemDTO>;

export const ActionOutputDTO = z.object({
  updatedChat: ChatInfoDTO,
  newActionActivity: ActionActivityDTO,
});
export type ActionOutputDTO = z.infer<typeof ActionOutputDTO>;
