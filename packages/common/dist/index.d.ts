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

declare const CreateProfileInput: z.ZodObject<{
    userId: z.ZodUUID;
    firstName: z.ZodString;
    lastName: z.ZodString;
    profilePictureUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type CreateProfileInput = z.infer<typeof CreateProfileInput>;
declare const UpdateProfileInput: z.ZodObject<{
    profileId: z.ZodUUID;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    profilePictureUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type UpdateProfileInput = z.infer<typeof UpdateProfileInput>;
declare const ProfileDTO: z.ZodObject<{
    id: z.ZodUUID;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z.ZodPipe<z.ZodDate, z.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z.ZodPipe<z.ZodString, z.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>;
    updatedAt: z.ZodNullable<z.ZodPipe<z.ZodUnion<readonly [z.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>, z.ZodPipe<z.ZodDate, z.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, Date>>, z.ZodPipe<z.ZodString, z.ZodTransform<luxon.DateTime<true> | luxon.DateTime<false>, string>>]>, z.ZodCustom<luxon.DateTime<boolean>, luxon.DateTime<boolean>>>>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    profilePictureUrl: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
type ProfileDTO = z.infer<typeof ProfileDTO>;

declare const FriendRequestStatus: z.ZodEnum<{
    PENDING: "PENDING";
    CANCELLED: "CANCELLED";
    DECLINED: "DECLINED";
    ACCEPTED: "ACCEPTED";
}>;

declare const RegisterInput: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
declare const LogInInput: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
declare const UserRole: z.ZodEnum<{
    USER: "USER";
    ADMIN: "ADMIN";
}>;
type UserRole = z.infer<typeof UserRole>;
declare const AuthProfileDTO: z.ZodObject<{
    id: z.ZodUUID;
    firstName: z.ZodString;
    lastName: z.ZodString;
    profilePictureUrl: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const AuthUserDTO: z.ZodObject<{
    id: z.ZodUUID;
    email: z.ZodString;
    role: z.ZodEnum<{
        USER: "USER";
        ADMIN: "ADMIN";
    }>;
    profile: z.ZodObject<{
        id: z.ZodUUID;
        firstName: z.ZodString;
        lastName: z.ZodString;
        profilePictureUrl: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;

export { AuthProfileDTO, AuthUserDTO, ChatDTO, ChatDetailDTO, ChatType, CreateProfileInput, DateTimeSchema, FriendRequestStatus, LogInInput, MessageDTO, MessageType, ObjectId, ProfileDTO, RegisterInput, SendMessageInput, UpdateProfileInput, UserRole, mergeAsyncIterators };
