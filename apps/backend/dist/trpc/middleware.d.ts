import { User } from '@repo/db';
export declare const isAuthed: import("@trpc/server").TRPCMiddlewareBuilder<import("./context").Context, object, {
    ctx: {
        user: User;
    };
}, unknown>;
export declare const isAdmin: import("@trpc/server").TRPCMiddlewareBuilder<import("./context").Context, object, {
    ctx: {
        user: User;
    };
}, unknown>;
