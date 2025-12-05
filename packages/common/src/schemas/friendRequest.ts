import { z } from 'zod';

import { DateTimeSchema, ObjectId } from './primitives';
import { id } from 'zod/v4/locales';

export const FriendRequestStatus = z.enum([
  'PENDING',
  'CANCELLED',
  'DECLINED',
  'ACCEPTED',
]);
export type FriendRequestStatus = z.infer<typeof FriendRequestStatus>;

export const FriendRequestDTO = z.object({
  id: ObjectId,
  status: FriendRequestStatus,
  sender: z.object({
    id: ObjectId,
    firstName: z.string(),
    lastName: z.string(),
    avatarUrl: z.string().nullable().optional(),
  }),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});
export type FriendRequestDTO = z.infer<typeof FriendRequestDTO>;
