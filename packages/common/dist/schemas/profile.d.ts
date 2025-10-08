import { z } from 'zod';
export declare const CreateProfileInput: z.ZodObject<{
    userId: z.ZodUUID;
    firstName: z.ZodString;
    lastName: z.ZodString;
    profilePictureUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateProfileInput = z.infer<typeof CreateProfileInput>;
export declare const UpdateProfileInput: z.ZodObject<{
    profileId: z.ZodUUID;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    profilePictureUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileInput>;
//# sourceMappingURL=profile.d.ts.map