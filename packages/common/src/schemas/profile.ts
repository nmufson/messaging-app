import { z } from 'zod';
import { DateTimeSchema, ObjectId } from './primitives';

export const CreateProfileInput = z.object({
  firstName: z
    .string()
    .min(1, 'Please enter first name')
    .max(50, 'First name must be 50 characters or less')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .default(''),
  lastName: z
    .string()
    .min(1, 'Please enter last name')
    .max(50, 'Last name must be 50 characters or less')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .default(''),
  avatarUrl: z
    .url('Must be a valid URL')
    .max(500, 'URL must be 500 characters or less')
    .optional(),
  headerUrl: z
    .url('Must be a valid URL')
    .max(500, 'URL must be 500 characters or less')
    .optional(),
  title: z.string().max(50, 'Title must be 50 characters or less').optional(),
  bio: z.string().max(250, 'Bio must be 250 characters or less').optional(),
});
export type CreateProfileInput = z.infer<typeof CreateProfileInput>;

export const UpdateProfileInput = CreateProfileInput.extend({
  id: ObjectId,
  firstName: z
    .string()
    .min(1, 'Please enter first name')
    .max(50, 'First name must be 50 characters or less')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'First name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .optional(),
  lastName: z
    .string()
    .min(1, 'Please enter last name')
    .max(50, 'Last name must be 50 characters or less')
    .regex(
      /^[a-zA-Z\s'-]+$/,
      'Last name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .optional(),
  avatarUrl: z
    .url('Must be a valid URL')
    .max(500, 'URL must be 500 characters or less')
    .nullish(),
  headerUrl: z
    .url('Must be a valid URL')
    .max(500, 'URL must be 500 characters or less')
    .nullish(),
  title: z.string().max(50, 'Title must be 50 characters or less').nullish(),
  bio: z.string().max(250, 'Bio must be 250 characters or less').nullish(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileInput>;

// TODO review this
export const ProfileDTO = z.object({
  id: ObjectId,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z
    .string()
    .nullable()
    .transform((val) => val ?? ''),
  headerUrl: z
    .string()
    .nullable()
    .transform((val) => val ?? ''),
  title: z
    .string()
    .nullable()
    .transform((val) => val ?? ''),
  bio: z
    .string()
    .nullable()
    .transform((val) => val ?? ''),
});
export type ProfileDTO = z.infer<typeof ProfileDTO>;

export const RelationshipToViewer = z.enum([
  'SELF',
  'FRIEND',
  'PENDING_OUTGOING_REQUEST',
  'PENDING_INCOMING_REQUEST',
  'NONE',
]);
export type RelationshipToViewer = z.infer<typeof RelationshipToViewer>;

export const ProfilePageDTO = z.object({
  ...ProfileDTO.shape,
  numOfFriends: z.number(),
  numOfChats: z.number(),
  numOfMessages: z.number(),
  relationshipToViewer: RelationshipToViewer,
  isOnline: z.boolean().nullish(),
  lastOnline: DateTimeSchema.nullish(),
});
export type ProfilePageDTO = z.infer<typeof ProfilePageDTO>;

export const IBaseProfile = z.object({
  id: ObjectId,
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().nullable(),
  isOnline: z.boolean().nullish(),
  lastOnline: z.date().nullish(),
});
export type IBaseProfile = z.infer<typeof IBaseProfile>;

export const BaseProfileDTO = IBaseProfile.extend({
  lastOnline: DateTimeSchema.nullish(),
});
export type BaseProfileDTO = z.infer<typeof BaseProfileDTO>;

export const PresenceUpdate = z.object({
  profileId: ObjectId,
  isOnline: z.boolean(),
  lastOnline: DateTimeSchema.nullable(),
});
export type PresenceUpdate = z.infer<typeof PresenceUpdate>;
