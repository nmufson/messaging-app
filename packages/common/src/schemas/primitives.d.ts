import { DateTime } from 'luxon';
import { z } from 'zod';
export declare const ObjectId: z.ZodUUID;
export type ObjectId = z.infer<typeof ObjectId>;
export declare const UserRole: z.ZodEnum<{
    USER: "USER";
    ADMIN: "ADMIN";
}>;
export type UserRole = z.infer<typeof UserRole>;
export declare const DateTimeSchema: z.ZodPipe<z.ZodUnion<readonly [z.ZodCustom<DateTime<boolean>, DateTime<boolean>>, z.ZodPipe<z.ZodDate, z.ZodTransform<DateTime<true> | DateTime<false>, Date>>]>, z.ZodCustom<DateTime<boolean>, DateTime<boolean>>>;
export type DateTimeSchema = z.infer<typeof DateTimeSchema>;
