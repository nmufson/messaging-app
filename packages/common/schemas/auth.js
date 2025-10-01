"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginInput = exports.RegisterInput = void 0;
var zod_1 = require("zod");
var Password = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .refine(function (password) { return /[A-Z]/.test(password); }, {
    message: 'Password must contain at least one uppercase letter',
})
    .refine(function (password) { return /[a-z]/.test(password); }, {
    message: 'Password must contain at least one lowercase letter',
})
    .refine(function (password) { return /[0-9]/.test(password); }, {
    message: 'Password must contain at least one number',
})
    .refine(function (password) { return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password); }, {
    message: 'Password must contain at least one special character',
});
exports.RegisterInput = zod_1.z
    .object({
    email: zod_1.z.email(),
    password: Password,
    confirmPassword: Password,
})
    .refine(function (data) { return data.password === data.confirmPassword; }, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.LoginInput = zod_1.z.object({
    email: zod_1.z.email(),
    password: zod_1.z.string(),
});
