import { z } from 'zod';
import { Profile } from './profile';
import { DateTimeSchema } from './conversation';

export const FriendRequestStatus = z.enum([
  'PENDING',
  'CANCELLED',
  'DECLINED',
  'ACCETPED',
]);

export const FriendRequest = z.object({
  id: z.string(),
  status: FriendRequestStatus,

  get sender() {
    return z.union([z.string(), Profile]);
  },
  get receiver() {
    return z.union([z.string(), Profile]);
  },

  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});
