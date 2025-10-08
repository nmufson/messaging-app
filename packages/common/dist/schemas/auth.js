"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogInInput = exports.RegisterInput = void 0;
const zod_1 = require("zod");
const Password = zod_1.z
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
exports.RegisterInput = zod_1.z
    .object({
    email: zod_1.z.email(),
    password: Password,
    confirmPassword: Password,
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.LogInInput = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string(),
});
