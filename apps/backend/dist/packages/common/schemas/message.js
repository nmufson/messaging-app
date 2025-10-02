"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.SendMessageInput = exports.MessageType = void 0;
const zod_1 = require("zod");
const primitives_1 = require("./primitives");
const profile_1 = require("./profile");
exports.MessageType = zod_1.z.enum(['TEXT', 'IMAGE']);
exports.SendMessageInput = zod_1.z.object({
    type: exports.MessageType,
    content: zod_1.z.string().nullable(),
    imageUrl: zod_1.z.string().nullable(),
    sender: primitives_1.ObjectId,
    chatId: primitives_1.ObjectId,
});
exports.Message = zod_1.z.object({
    type: exports.MessageType,
    content: zod_1.z.string().nullable(),
    imageUrl: zod_1.z.string().nullable(),
    // get sender() {
    //   return z.union([ObjectId, Profile]);
    // },
    sender: zod_1.z.union([primitives_1.ObjectId, profile_1.Profile]),
    chatId: primitives_1.ObjectId,
    createdAt: primitives_1.DateTimeSchema,
    updatedAt: primitives_1.DateTimeSchema.optional(),
});
