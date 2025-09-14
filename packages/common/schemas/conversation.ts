import { Dir } from 'fs';
import { DateTime } from 'luxon';
import z from 'zod';
import { Message } from './message';
import { Profile } from './profile';

export const ConversationType = z.enum(['GROUP', 'DIRECT']);

export const DateTimeSchema = z.string().transform((str, ctx) => {
  const dt = DateTime.fromISO(str);
  if (!dt.isValid) {
    return z.NEVER;
  }
  return dt;
});

const BaseConversation = z.object({
  id: z.string(),
  messages: Message.array(),
  get profiles() {
    return Profile.array();
  },
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});

const DirectConversation = BaseConversation.extend({
  type: ConversationType.enum.DIRECT,
});

const GroupConversation = BaseConversation.extend({
  type: ConversationType.enum.GROUP,
});

export const Conversation = z.discriminatedUnion('type', [
  DirectConversation,
  GroupConversation,
]);
