"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageInput = exports.MessageType = void 0;
const zod_1 = require("zod");
const primitives_1 = require("./primitives");
exports.MessageType = zod_1.z.enum(['TEXT', 'IMAGE']);
exports.SendMessageInput = zod_1.z.object({
    type: exports.MessageType,
    content: zod_1.z.string().nullable(),
    imageUrl: zod_1.z.string().nullable(),
    sender: primitives_1.ObjectId,
    chatId: primitives_1.ObjectId,
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
