import { z } from 'zod';
export declare const MessageType: z.ZodEnum<{
    TEXT: "TEXT";
    IMAGE: "IMAGE";
}>;
export type MessageType = z.infer<typeof MessageType>;
export declare const SendMessageInput: z.ZodObject<{
    type: z.ZodEnum<{
        TEXT: "TEXT";
        IMAGE: "IMAGE";
    }>;
    content: z.ZodNullable<z.ZodString>;
    imageUrl: z.ZodNullable<z.ZodString>;
    sender: z.ZodUUID;
    chatId: z.ZodUUID;
}, z.core.$strip>;
export type SendMessageInput = z.infer<typeof SendMessageInput>;
//# sourceMappingURL=message.d.ts.map