import { Dir } from 'fs';
import z from 'zod';

import { DateTimeSchema, ObjectId } from './primitives';

export const ChatType = z.enum(['GROUP', 'DIRECT']);

// const BaseChat = z.object({
//   id: ObjectId,
//   messages: Message.array(),
//   get participants() {
//     return Profile.array();
//   },
//   createdAt: DateTimeSchema,
//   updatedAt: DateTimeSchema.optional(),
// });

// const DirectChat = BaseChat.extend({
//   type: ChatType.enum.DIRECT,
// });

// const GroupChat = BaseChat.extend({
//   type: ChatType.enum.GROUP,
//   name: z.string().nullable(),
//   groupPictureUrl: z.string().nullable(),
//   creator: z.union([ObjectId, Profile]),
// });

// export const Chat = z.discriminatedUnion('type', [DirectChat, GroupChat]);
// export type Chat = z.infer<typeof Chat>;

export const ChatDTO = z.object({
  id: ObjectId,
  type: ChatType,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
  participants: z.array(
    z.object({
      id: ObjectId,
      firstName: z.string(),
      lastName: z.string(),
      profilePictureUrl: z.string().nullable(),
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
  // Group-specific fields
  name: z.string().nullable(),
  groupPictureUrl: z.string().nullable(),
  creator: z
    .object({
      id: ObjectId,
      firstName: z.string(),
      lastName: z.string(),
    })
    .optional(),
});
export type ChatDTO = z.infer<typeof ChatDTO>;

// export const ChatDetailDTO = ChatDTO.extend({
//   messages: Message.array(),
// });
// export type ChatDetailDTO = z.infer<typeof ChatDetailDTO>;
