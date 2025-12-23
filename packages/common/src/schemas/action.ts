import z from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';
import { BaseProfileDTO, IBaseProfile } from './profile';

export const ChatActionType = z.enum([
  'CHAT_CREATED',
  'MEMBER_ADDED',
  'MEMBER_REMOVED',
  'MEMBER_LEFT',
  'NAME_CHANGED',
  'PICTURE_CHANGED',
]);
export type ChatActionType = z.infer<typeof ChatActionType>;

export const IChatAction = z.object({
  id: ObjectId,
  chatId: ObjectId,
  actionType: ChatActionType,
  actorId: ObjectId,
  targetId: ObjectId.nullable(),
  createdAt: z.date(),
  content: z.string().nullable(),
});
export type IChatAction = z.infer<typeof IChatAction>;

export const ChatActionDTO = IChatAction.extend({
  createdAt: DateTimeSchema,
});
export type ChatActionDTO = z.infer<typeof ChatActionDTO>;

export const ChatActionWithActorDTO = ChatActionDTO.omit({
  actorId: true,
  targetId: true,
}).extend({
  actor: BaseProfileDTO,
  target: BaseProfileDTO.nullish(),
});
export type ChatActionWithActorDTO = z.infer<typeof ChatActionWithActorDTO>;
