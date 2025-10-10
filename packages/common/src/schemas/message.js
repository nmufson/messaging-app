import { z } from 'zod';
import { ObjectId } from './primitives';
export const MessageType = z.enum(['TEXT', 'IMAGE']);
export const SendMessageInput = z.object({
    type: MessageType,
    content: z.string().nullable(),
    imageUrl: z.string().nullable(),
    sender: ObjectId,
    chatId: ObjectId,
});
// export const Message = z.object({
//   type: MessageType,
//   content: z.string().nullable(),
//   imageUrl: z.string().nullable(),
//   get sender() {
//     return z.union([ObjectId, Profile]);
//   },
//   chatId: ObjectId,
//   createdAt: DateTimeSchema,
//   updatedAt: DateTimeSchema.optional(),
// });
