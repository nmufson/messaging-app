import z from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';
import { MessageDTO } from './message';

export const ChatType = z.enum(['GROUP', 'DIRECT']);
export type ChatType = z.infer<typeof ChatType>;
// ? may need to separate ChatDetailDTO and ChatListItemDTO

export const ChatDTO = z.object({
  id: ObjectId,
  type: ChatType,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  participants: z.array(
    z.object({
      id: ObjectId,
      firstName: z.string(),
      lastName: z.string(),
      profilePictureUrl: z.string().nullable(),
    })
  ),
  messages: MessageDTO.array(),
  // Group-specific fields
  name: z.string().nullable(),
  groupPictureUrl: z.string().nullable(),
  creatorId: ObjectId,
});
export type ChatDTO = z.infer<typeof ChatDTO>;

export const ChatDetailDTO = ChatDTO.extend({});

// export const ChatDetailDTO = ChatDTO.extend({
//   messages: Message.array(),
// });
// export type ChatDetailDTO = z.infer<typeof ChatDetailDTO>;
