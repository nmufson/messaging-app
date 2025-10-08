import z from 'zod';
export declare const UserRole: z.ZodEnum<{
    USER: "USER";
    ADMIN: "ADMIN";
}>;
export type UserRole = z.infer<typeof UserRole>;
//# sourceMappingURL=user.d.ts.map