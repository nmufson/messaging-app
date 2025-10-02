"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = exports.ChatType = void 0;
const zod_1 = __importDefault(require("zod"));
const message_1 = require("./message");
const profile_1 = require("./profile");
const primitives_1 = require("./primitives");
exports.ChatType = zod_1.default.enum(['GROUP', 'DIRECT']);
const BaseChat = zod_1.default.object({
    id: primitives_1.ObjectId,
    messages: message_1.Message.array(),
    get participants() {
        return profile_1.Profile.array();
    },
    createdAt: primitives_1.DateTimeSchema,
    updatedAt: primitives_1.DateTimeSchema.optional(),
});
const DirectChat = BaseChat.extend({
    type: exports.ChatType.enum.DIRECT,
});
const GroupChat = BaseChat.extend({
    type: exports.ChatType.enum.GROUP,
});
exports.Chat = zod_1.default.discriminatedUnion('type', [DirectChat, GroupChat]);
