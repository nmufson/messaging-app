import * as luxon from 'luxon';
import { DateTime } from 'luxon';
import z$1, { z } from 'zod';
export { z } from 'zod';
export { default as superjson } from 'superjson';

declare function mergeAsyncIterators<T>(iterables: AsyncIterable<T>[]): AsyncGenerator<Awaited<T>, void, unknown>;

declare const ObjectId: z.ZodUUID;
type ObjectId = z.infer<typeof ObjectId>;
declare const DateTimeSchema: z.ZodPipe<z.ZodUnion<readonly [z.ZodCustom<DateTime<boolean>, DateTime<boolean>>, z.ZodPipe<z.ZodDate, z.ZodTransform<DateTime<true> | DateTime<false>, Date>>, z.ZodPipe<z.ZodString, z.ZodTransform<DateTime<true> | DateTime<false>, string>>]>, z.ZodCustom<DateTime<boolean>, DateTime<boolean>>>;
type DateTimeSchema = z.infer<typeof DateTimeSchema>;

declare const UserRole: z$1.ZodEnum<{
    USER: "USER";
    ADMIN: "ADMIN";
}>;
type UserRole = z$1.infer<typeof UserRole>;

declare const MessageType: z.ZodEnum<{
    TEXT: "TEXT";
    IMAGE: "IMAGE";
}>;
type MessageType = z.infer<typeof MessageType>;
declare const SendMessageInput: z.ZodObject<{
    type: z.ZodEnum<{
        TEXT: "TEXT";
        IMAGE: "IMAGE";
    }>;
    content: z.ZodNullable<z.ZodString>;
    imageUrl: z.ZodNullable<z.ZodString>;
    sender: z.ZodUUID;
    chatId: z.ZodUUID;
}, z.core.$strip>;
type SendMessageInput = z.infer<typeof SendMessageInput>;
declare const MessageDTO: z.ZodObject<{
    id: z.ZodUUID;
    type: z.ZodEnum<{
        TEXT: "TEXT";
        IMAGE: "IMAGE";
    }>;
    content: z.ZodNullable<z.ZodString>;
    imageUrl: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z.ZodPipe<z.ZodDate, z.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z.ZodPipe<z.ZodString, z.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>;
    updatedAt: z.ZodNullable<z.ZodPipe<z.ZodUnion<readonly [z.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z.ZodPipe<z.ZodDate, z.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z.ZodPipe<z.ZodString, z.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>>;
    senderId: z.ZodUUID;
}, z.core.$strip>;
type MessageDTO = z.infer<typeof MessageDTO>;

declare const ChatType: z$1.ZodEnum<{
    GROUP: "GROUP";
    DIRECT: "DIRECT";
}>;
declare const ChatDTO: z$1.ZodObject<{
    id: z$1.ZodUUID;
    type: z$1.ZodEnum<{
        GROUP: "GROUP";
        DIRECT: "DIRECT";
    }>;
    createdAt: z$1.ZodPipe<z$1.ZodUnion<readonly [z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z$1.ZodPipe<z$1.ZodDate, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z$1.ZodPipe<z$1.ZodString, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>;
    updatedAt: z$1.ZodNullable<z$1.ZodPipe<z$1.ZodUnion<readonly [z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z$1.ZodPipe<z$1.ZodDate, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z$1.ZodPipe<z$1.ZodString, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>>;
    participants: z$1.ZodArray<z$1.ZodObject<{
        id: z$1.ZodUUID;
        firstName: z$1.ZodString;
        lastName: z$1.ZodString;
        profilePictureUrl: z$1.ZodNullable<z$1.ZodString>;
    }, z$1.core.$strip>>;
    messages: z$1.ZodArray<z$1.ZodObject<{
        id: z$1.ZodUUID;
        type: z$1.ZodEnum<{
            TEXT: "TEXT";
            IMAGE: "IMAGE";
        }>;
        content: z$1.ZodNullable<z$1.ZodString>;
        imageUrl: z$1.ZodNullable<z$1.ZodString>;
        createdAt: z$1.ZodPipe<z$1.ZodUnion<readonly [z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z$1.ZodPipe<z$1.ZodDate, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z$1.ZodPipe<z$1.ZodString, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>;
        updatedAt: z$1.ZodNullable<z$1.ZodPipe<z$1.ZodUnion<readonly [z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z$1.ZodPipe<z$1.ZodDate, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z$1.ZodPipe<z$1.ZodString, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>>;
        senderId: z$1.ZodUUID;
    }, z$1.core.$strip>>;
    name: z$1.ZodNullable<z$1.ZodString>;
    groupPictureUrl: z$1.ZodNullable<z$1.ZodString>;
    creatorId: z$1.ZodUUID;
}, z$1.core.$strip>;
type ChatDTO = z$1.infer<typeof ChatDTO>;
declare const ChatDetailDTO: z$1.ZodObject<{
    id: z$1.ZodUUID;
    type: z$1.ZodEnum<{
        GROUP: "GROUP";
        DIRECT: "DIRECT";
    }>;
    createdAt: z$1.ZodPipe<z$1.ZodUnion<readonly [z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z$1.ZodPipe<z$1.ZodDate, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z$1.ZodPipe<z$1.ZodString, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>;
    updatedAt: z$1.ZodNullable<z$1.ZodPipe<z$1.ZodUnion<readonly [z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z$1.ZodPipe<z$1.ZodDate, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z$1.ZodPipe<z$1.ZodString, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>>;
    participants: z$1.ZodArray<z$1.ZodObject<{
        id: z$1.ZodUUID;
        firstName: z$1.ZodString;
        lastName: z$1.ZodString;
        profilePictureUrl: z$1.ZodNullable<z$1.ZodString>;
    }, z$1.core.$strip>>;
    messages: z$1.ZodArray<z$1.ZodObject<{
        id: z$1.ZodUUID;
        type: z$1.ZodEnum<{
            TEXT: "TEXT";
            IMAGE: "IMAGE";
        }>;
        content: z$1.ZodNullable<z$1.ZodString>;
        imageUrl: z$1.ZodNullable<z$1.ZodString>;
        createdAt: z$1.ZodPipe<z$1.ZodUnion<readonly [z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z$1.ZodPipe<z$1.ZodDate, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z$1.ZodPipe<z$1.ZodString, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>;
        updatedAt: z$1.ZodNullable<z$1.ZodPipe<z$1.ZodUnion<readonly [z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z$1.ZodPipe<z$1.ZodDate, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z$1.ZodPipe<z$1.ZodString, z$1.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z$1.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>>;
        senderId: z$1.ZodUUID;
    }, z$1.core.$strip>>;
    name: z$1.ZodNullable<z$1.ZodString>;
    groupPictureUrl: z$1.ZodNullable<z$1.ZodString>;
    creatorId: z$1.ZodUUID;
}, z$1.core.$strip>;

export { ChatDTO, ChatDetailDTO, ChatType, DateTimeSchema, MessageDTO, MessageType, ObjectId, SendMessageInput, UserRole, mergeAsyncIterators };
