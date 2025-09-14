import { z } from 'zod';
import { Conversation, DateTimeSchema } from './conversation';
import { Message } from './message';
import { FriendRequest } from './friendRequest';

export const Profile = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  profilePictureUrl: z.string().nullable(),

  get friends() {
    return z.union([z.string(), Profile]).array();
  },

  sentFriendRequests: z.union([z.string(), FriendRequest]).array(),
  receivedFriendRequests: z.union([z.string(), FriendRequest]).array(),

  messages: z.union([z.string(), Message]).array(),

  get conversations() {
    return z.union([z.string(), Conversation]).array();
  },

  user: z.string(),

  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.optional(),
});

export type Profile = z.infer<typeof Profile>;
