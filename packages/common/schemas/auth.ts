import { z } from 'zod';

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
