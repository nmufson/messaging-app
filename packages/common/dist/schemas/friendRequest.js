"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestStatus = void 0;
const zod_1 = require("zod");
exports.FriendRequestStatus = zod_1.z.enum([
    'PENDING',
    'CANCELLED',
    'DECLINED',
    'ACCEPTED',
]);
// export const FriendRequest = z.object({
//   id: ObjectId,
//   status: FriendRequestStatus,
//   get sender() {
//     return z.union([ObjectId, Profile]);
//   },
//   get receiver() {
//     return z.union([ObjectId, Profile]);
//   },
//   createdAt: DateTimeSchema,
//   updatedAt: DateTimeSchema.optional(),
// });
