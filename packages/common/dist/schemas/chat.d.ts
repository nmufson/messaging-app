import z from 'zod';
export declare const ChatType: z.ZodEnum<{
    GROUP: "GROUP";
    DIRECT: "DIRECT";
}>;
export declare const ChatDTO: z.ZodObject<{
    id: z.ZodUUID;
    type: z.ZodEnum<{
        GROUP: "GROUP";
        DIRECT: "DIRECT";
    }>;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodCustom<import("luxon").DateTime<boolean>, import("luxon").DateTime<boolean>>, z.ZodPipe<z.ZodDate, z.ZodTransform<import("luxon").DateTime<true> | import("luxon").DateTime<false>, Date>>]>, z.ZodCustom<import("luxon").DateTime<boolean>, import("luxon").DateTime<boolean>>>;
    updatedAt: z.ZodNullable<z.ZodPipe<z.ZodUnion<readonly [z.ZodCustom<import("luxon").DateTime<boolean>, import("luxon").DateTime<boolean>>, z.ZodPipe<z.ZodDate, z.ZodTransform<import("luxon").DateTime<true> | import("luxon").DateTime<false>, Date>>]>, z.ZodCustom<import("luxon").DateTime<boolean>, import("luxon").DateTime<boolean>>>>;
    participants: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        firstName: z.ZodString;
        lastName: z.ZodString;
        profilePictureUrl: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    messages: z.ZodArray<z.ZodObject<{
        content: z.ZodString;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodCustom<import("luxon").DateTime<boolean>, import("luxon").DateTime<boolean>>, z.ZodPipe<z.ZodDate, z.ZodTransform<import("luxon").DateTime<true> | import("luxon").DateTime<false>, Date>>]>, z.ZodCustom<import("luxon").DateTime<boolean>, import("luxon").DateTime<boolean>>>;
        sender: z.ZodObject<{
            firstName: z.ZodString;
            lastName: z.ZodString;
            profilePictureUrl: z.ZodNullable<z.ZodString>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    name: z.ZodNullable<z.ZodString>;
    groupPictureUrl: z.ZodNullable<z.ZodString>;
    creator: z.ZodObject<{
        id: z.ZodUUID;
        firstName: z.ZodString;
        lastName: z.ZodString;
        profilePictureUrl: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ChatDTO = z.infer<typeof ChatDTO>;
//# sourceMappingURL=chat.d.ts.map