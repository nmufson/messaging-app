"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatDTO = exports.ChatType = void 0;
const zod_1 = __importDefault(require("zod"));
const primitives_1 = require("./primitives");
exports.ChatType = zod_1.default.enum(['GROUP', 'DIRECT']);
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
exports.ChatDTO = zod_1.default.object({
    id: primitives_1.ObjectId,
    type: exports.ChatType,
    createdAt: primitives_1.DateTimeSchema,
    updatedAt: primitives_1.DateTimeSchema.nullable(),
    participants: zod_1.default.array(zod_1.default.object({
        id: primitives_1.ObjectId,
        firstName: zod_1.default.string(),
        lastName: zod_1.default.string(),
        profilePictureUrl: zod_1.default.string().nullable(),
    })),
    messages: zod_1.default
        .object({
        content: zod_1.default.string(),
        createdAt: primitives_1.DateTimeSchema,
        sender: zod_1.default.object({
            firstName: zod_1.default.string(),
            lastName: zod_1.default.string(),
            profilePictureUrl: zod_1.default.string().nullable(),
        }),
    })
        .array(),
    // Group-specific fields
    name: zod_1.default.string().nullable(),
    groupPictureUrl: zod_1.default.string().nullable(),
    creator: zod_1.default.object({
        id: primitives_1.ObjectId,
        firstName: zod_1.default.string(),
        lastName: zod_1.default.string(),
        profilePictureUrl: zod_1.default.string().nullable(),
    }),
});
// export const ChatDetailDTO = ChatDTO.extend({
//   messages: Message.array(),
// });
// export type ChatDetailDTO = z.infer<typeof ChatDetailDTO>;
