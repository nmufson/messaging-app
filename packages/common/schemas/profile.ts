import { z } from 'zod';
import { ObjectId } from './primitives';

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

export const CreateProfileInput = z.object({
  userId: ObjectId,
  firstName: z.string(),
  lastName: z.string(),
  profilePictureUrl: z.string().optional(),
});
export type CreateProfileInput = z.infer<typeof CreateProfileInput>;

export const UpdateProfileInput = z.object({
  profileId: ObjectId,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePictureUrl: z.string().optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileInput>;
