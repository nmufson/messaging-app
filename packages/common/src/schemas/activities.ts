import z from 'zod';
import { ChatActionDTO, IChatAction } from './action';
import { IMessageWithSender, MessageDTO, MessageSenderDTO } from './message';
import { SortDirection } from './primitives';

export const ActivityType = z.enum(['message', 'action']);
export type ActivityType = z.infer<typeof ActivityType>;

export const IMessageActivity = IMessageWithSender.extend({
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
  sender: MessageSenderDTO,
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

export const ActivitiesQueryOptions = z
  .object({
    minActivities: z.number().min(1),
    sortDirection: SortDirection,
  })
  .partial();
export type ActivitiesQueryOptions = z.infer<typeof ActivitiesQueryOptions>;
