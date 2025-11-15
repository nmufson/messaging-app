import { z } from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';

export const CreateProfileInput = z.object({
  userId: ObjectId,
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().optional(),
});
export type CreateProfileInput = z.infer<typeof CreateProfileInput>;

export const UpdateProfileInput = z.object({
  profileId: ObjectId,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileInput>;

export const ProfileDTO = z.object({
  id: ObjectId,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().nullable(),
  headerUrl: z.string().nullable(),
  bio: z.string().nullable(),
});
export type ProfileDTO = z.infer<typeof ProfileDTO>;

export const ProfilePageDTO = z.object({
  ...ProfileDTO.shape,
  numOfFriends: z.number(),
  numOfChats: z.number(),
  numOfMessages: z.number(),
  hasOutstandingFriendRequest: z.boolean(),
});
export type ProfilePageDTO = z.infer<typeof ProfilePageDTO>;

export const ListProfileDTO = z.object({
  id: ObjectId,
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().nullable(),
});
export type ListProfileDTO = z.infer<typeof ListProfileDTO>;

export const ListProfileWithPresenceDTO = z.object({
  ...ListProfileDTO.shape,
  isOnline: z.boolean(),
  lastOnline: DateTimeSchema.nullable(),
});
