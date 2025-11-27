import { z } from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';

export const CreateProfileInput = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .default(''),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .default(''),
  avatarUrl: z
    .string()
    .url('Must be a valid URL')
    .max(500, 'URL must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  headerUrl: z
    .string()
    .url('Must be a valid URL')
    .max(500, 'URL must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(200, 'Bio must be 500 characters or less')
    .optional()
    .or(z.literal('')),
});
export type CreateProfileInput = z.infer<typeof CreateProfileInput>;

export const UpdateProfileInput = z.object({
  profileId: ObjectId,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().optional(),
  headerUrl: z.string().optional(),
  bio: z.string().optional(),
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
  isOnline: z.boolean().nullish(),
  lastOnline: DateTimeSchema.nullish(),
});
export type ListProfileDTO = z.infer<typeof ListProfileDTO>;

export const PresenceUpdate = z.object({
  profileId: ObjectId,
  isOnline: z.boolean(),
  lastOnline: DateTimeSchema.nullable(),
});
export type PresenceUpdate = z.infer<typeof PresenceUpdate>;
