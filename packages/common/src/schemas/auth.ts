import { z } from 'zod';
import { ObjectId } from './primitives';

const Password = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .refine((password) => /[A-Z]/.test(password), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((password) => /[a-z]/.test(password), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((password) => /[0-9]/.test(password), {
    message: 'Password must contain at least one number',
  })
  .refine((password) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password), {
    message: 'Password must contain at least one special character',
  });

export const RegisterInput = z
  .object({
    email: z.email(),
    password: Password,
    confirmPassword: Password,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const LogInInput = z.object({
  email: z.email(),
  password: z.string(),
});
export const UserRole = z.enum(['USER', 'ADMIN']);
export type UserRole = z.infer<typeof UserRole>;

export const AuthProfileDTO = z.object({
  id: ObjectId,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  profilePictureUrl: z.string().url().nullable(),
});

export const AuthUserDTO = z.object({
  id: ObjectId,
  email: z.string().email(),
  role: UserRole,
  profile: AuthProfileDTO,
});
