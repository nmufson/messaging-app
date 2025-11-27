import { z } from 'zod';
import { ObjectId } from './primitives';

export const CreateUserInput = z
  .object({
    email: z
      .string()
      .min(1, 'Please enter email address')
      .email('Must be a valid email address')
      .default(''),
    password: z
      .string()
      .min(1, 'Please enter password')
      .min(8, 'Password must be at least 8 characters long')
      .regex(/\d/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character'
      )
      .default(''),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password')
      .default(''),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type CreateUserInput = z.infer<typeof CreateUserInput>;

export const LogInUserInput = z.object({
  email: z.string().min(1, 'Please enter email address').email().default(''),
  password: z.string().min(1, 'Please enter password').default(''),
});
export type LogInUserInput = z.infer<typeof LogInUserInput>;

export const UserRole = z.enum(['USER', 'ADMIN']);
export type UserRole = z.infer<typeof UserRole>;

export const AuthProfileDTO = z.object({
  id: ObjectId,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  avatarUrl: z.string().url().nullable(),
});

export const AuthUserDTO = z.object({
  id: ObjectId,
  email: z.string().email(),
  role: UserRole,
  profile: AuthProfileDTO.nullable(),
});
