"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileInput = exports.CreateProfileInput = exports.Profile = void 0;
var zod_1 = require("zod");
var chat_1 = require("./chat");
var primitives_1 = require("./primitives");
var message_1 = require("./message");
var friendRequest_1 = require("./friendRequest");
exports.Profile = zod_1.z.object({
    id: primitives_1.ObjectId,
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    profilePictureUrl: zod_1.z.string().nullable(),
    get friends() {
        return zod_1.z.union([primitives_1.ObjectId, exports.Profile]).array();
    },
    sentFriendRequests: zod_1.z.union([primitives_1.ObjectId, friendRequest_1.FriendRequest]).array(),
    receivedFriendRequests: zod_1.z.union([primitives_1.ObjectId, friendRequest_1.FriendRequest]).array(),
    messages: zod_1.z.union([primitives_1.ObjectId, message_1.Message]).array(),
    get conversations() {
        return zod_1.z.union([primitives_1.ObjectId, chat_1.Chat]).array();
    },
    user: primitives_1.ObjectId,
    createdAt: primitives_1.DateTimeSchema,
    updatedAt: primitives_1.DateTimeSchema.optional(),
});
exports.CreateProfileInput = zod_1.z.object({
    userId: primitives_1.ObjectId,
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    profilePictureUrl: zod_1.z.string().optional(),
});
exports.UpdateProfileInput = zod_1.z.object({
    profileId: primitives_1.ObjectId,
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    profilePictureUrl: zod_1.z.string().optional(),
});
