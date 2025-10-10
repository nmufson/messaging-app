import z from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';
import { MessageType } from './message';
export const ChatType = z.enum(['GROUP', 'DIRECT']);
export const MessageDTO = z.object({
    id: ObjectId,
    type: MessageType,
    content: z.string().nullable(),
    imageUrl: z.string().nullable(),
    createdAt: DateTimeSchema,
    updatedAt: DateTimeSchema.nullable(),
    senderId: ObjectId,
});
// ? may need to separate ChatDetailDTO and ChatListItemDTO
export const ChatDTO = z.object({
    id: ObjectId,
    type: ChatType,
    createdAt: DateTimeSchema,
    updatedAt: DateTimeSchema.nullable(),
    participants: z.array(z.object({
        id: ObjectId,
        firstName: z.string(),
        lastName: z.string(),
        profilePictureUrl: z.string().nullable(),
    })),
    messages: MessageDTO.array(),
    // Group-specific fields
    name: z.string().nullable(),
    groupPictureUrl: z.string().nullable(),
    creatorId: ObjectId,
});
export const ChatDetailDTO = ChatDTO.extend({});
// export const ChatDetailDTO = ChatDTO.extend({
//   messages: Message.array(),
// });
// export type ChatDetailDTO = z.infer<typeof ChatDetailDTO>;
