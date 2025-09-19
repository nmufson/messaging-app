import { Dir } from 'fs';
import z from 'zod';
import { Message } from './message';
import { Profile } from './profile';
import { DateTimeSchema, ObjectId } from './primitives';

export const ChatType = z.enum(['GROUP', 'DIRECT']);

const BaseChat = z.object({
  id: ObjectId,
  messages: Message.array(),
  get profiles() {
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
});

export const Chat = z.discriminatedUnion('type', [DirectChat, GroupChat]);
