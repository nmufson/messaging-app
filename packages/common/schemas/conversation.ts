import { Dir } from 'fs';
import z from 'zod';
import { Message } from './message';
import { Profile } from './profile';
import { DateTimeSchema, ObjectId } from './primitives';

export const ConversationType = z.enum(['GROUP', 'DIRECT']);

const BaseConversation = z.object({
  id: ObjectId,
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
