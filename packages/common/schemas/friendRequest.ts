import { z } from 'zod';
import { Profile } from './profile';
import { DateTimeSchema, ObjectId } from './primitives';

export const FriendRequestStatus = z.enum([
  'PENDING',
  'CANCELLED',
  'DECLINED',
  'ACCETPED',
]);

export const FriendRequest = z.object({
  id: ObjectId,
  status: FriendRequestStatus,

  get sender() {
    return z.union([ObjectId, Profile]);
  },
  get receiver() {
    return z.union([ObjectId, Profile]);
  },

  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});
