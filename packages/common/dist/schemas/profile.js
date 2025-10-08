"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileInput = exports.CreateProfileInput = void 0;
const zod_1 = require("zod");
const primitives_1 = require("./primitives");
// export const Profile = z.object({
//   id: ObjectId,
//   firstName: z.string(),
//   lastName: z.string(),
//   profilePictureUrl: z.string().nullable(),
//   get friends() {
//     return z.union([ObjectId, Profile]).array();
//   },
//   sentFriendRequests: z.union([ObjectId, FriendRequest]).array(),
//   receivedFriendRequests: z.union([ObjectId, FriendRequest]).array(),
//   messages: z.union([ObjectId, Message]).array(),
//   get conversations() {
//     return z.union([ObjectId, Chat]).array();
//   },
//   user: ObjectId,
//   createdAt: DateTimeSchema,
//   updatedAt: DateTimeSchema.optional(),
// });
// export type Profile = z.infer<typeof Profile>;
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
