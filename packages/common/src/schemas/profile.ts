import { z } from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';

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

export const ProfileDTO = z.object({
  id: ObjectId,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  firstName: z.string(),
  lastName: z.string(),
  profilePictureUrl: z.string().nullable(),
});
export type ProfileDTO = z.infer<typeof ProfileDTO>;

export const ProfilePageDTO = z.object({
  ...ProfileDTO.shape,
  numOfFriends: z.number(),
  numOfChats: z.number(),
  numOfMessages: z.number(),
});
export type ProfilePageDTO = z.infer<typeof ProfilePageDTO>;

export const ListProfileDTO = z.object({
  id: ObjectId,
  firstName: z.string(),
  lastName: z.string(),
  profilePictureUrl: z.string().nullable(),
});
export type ListProfileDTO = z.infer<typeof ListProfileDTO>;
