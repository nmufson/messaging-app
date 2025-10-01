"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = exports.ChatType = void 0;
var zod_1 = __importDefault(require("zod"));
var message_1 = require("./message");
var profile_1 = require("./profile");
var primitives_1 = require("./primitives");
exports.ChatType = zod_1.default.enum(['GROUP', 'DIRECT']);
var BaseChat = zod_1.default.object({
    id: primitives_1.ObjectId,
    messages: message_1.Message.array(),
    get profiles() {
        return profile_1.Profile.array();
    },
    createdAt: primitives_1.DateTimeSchema,
    updatedAt: primitives_1.DateTimeSchema.optional(),
});
var DirectChat = BaseChat.extend({
    type: exports.ChatType.enum.DIRECT,
});
var GroupChat = BaseChat.extend({
    type: exports.ChatType.enum.GROUP,
});
exports.Chat = zod_1.default.discriminatedUnion('type', [DirectChat, GroupChat]);
