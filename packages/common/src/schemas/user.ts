import z from 'zod';
import { ObjectId } from './primitives';
import { profile } from 'console';

export const UserRole = z.enum(['USER', 'ADMIN']);
export type UserRole = z.infer<typeof UserRole>;

export const ProfileDTO = z.object({
  id: ObjectId,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  profilePictureUrl: z.string().url().nullable(),
});

export const AuthUserDTO = z.object({
  id: ObjectId,
  email: z.string().email(),
  role: UserRole,
  profile: ProfileDTO,
});
