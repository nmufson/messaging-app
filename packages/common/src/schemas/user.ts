import z from 'zod';

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
