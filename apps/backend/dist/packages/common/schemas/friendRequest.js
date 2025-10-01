"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequest = exports.FriendRequestStatus = void 0;
const zod_1 = require("zod");
const profile_1 = require("./profile");
const primitives_1 = require("./primitives");
exports.FriendRequestStatus = zod_1.z.enum([
    'PENDING',
    'CANCELLED',
    'DECLINED',
    'ACCEPTED',
]);
exports.FriendRequest = zod_1.z.object({
    id: primitives_1.ObjectId,
    status: exports.FriendRequestStatus,
    get sender() {
        return zod_1.z.union([primitives_1.ObjectId, profile_1.Profile]);
    },
    get receiver() {
        return zod_1.z.union([primitives_1.ObjectId, profile_1.Profile]);
    },
    createdAt: primitives_1.DateTimeSchema,
    updatedAt: primitives_1.DateTimeSchema.optional(),
});
