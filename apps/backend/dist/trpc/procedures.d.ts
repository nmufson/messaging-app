export declare const publicProcedure: import("@trpc/server").TRPCProcedureBuilder<import("./context").Context, object, object, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export declare const userProcedure: import("@trpc/server").TRPCProcedureBuilder<import("./context").Context, object, {
    ctx: {
        user: import("@prisma/client").User;
    };
}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export declare const adminProcedure: import("@trpc/server").TRPCProcedureBuilder<import("./context").Context, object, {
    ctx: {
        user: import("@prisma/client").User;
    };
}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
