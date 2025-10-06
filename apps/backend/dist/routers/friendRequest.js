"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routers/friendRequest.ts
var friendRequest_exports = {};
__export(friendRequest_exports, {
  friendRequestRouter: () => friendRequestRouter
});
module.exports = __toCommonJS(friendRequest_exports);
var import_primitives = require("@common/schemas/primitives");

// src/trpc/context.ts
var import_db = require("@db");

// src/trpc/init.ts
var import_server = require("@trpc/server");
var import_common = require("@common");
var t = import_server.initTRPC.context().create({
  transformer: import_common.superjson
});
var router = t.router;

// src/trpc/middleware.ts
var import_server2 = require("@trpc/server");
var isAuthed = t.middleware(
  ({ ctx, next }) => {
    if (!ctx.user) {
      throw new import_server2.TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }
);
var isAdmin = t.middleware(
  ({ ctx, next }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new import_server2.TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be an admin to access this route"
      });
    }
    return next({ ctx });
  }
);

// src/trpc/procedures.ts
var publicProcedure = t.procedure;
var userProcedure = t.procedure.use(isAuthed);
var adminProcedure = t.procedure.use(isAuthed).use(isAdmin);

// src/routers/friendRequest.ts
var import_common2 = require("@common");
var import_friendRequest = require("@common/schemas/friendRequest");
var import_server3 = require("@trpc/server");
var friendRequestRouter = router({
  sendNew: userProcedure.input(
    import_common2.z.object({
      senderId: import_primitives.ObjectId,
      receiverId: import_primitives.ObjectId
    })
  ).mutation(async ({ ctx, input }) => {
    const { senderId, receiverId } = input;
    const newRequest = ctx.prisma.friendRequest.create({
      data: {
        senderId,
        receiverId
      }
    });
    return newRequest;
  }),
  update: userProcedure.input(
    import_common2.z.object({
      newStatus: import_friendRequest.FriendRequestStatus,
      senderId: import_primitives.ObjectId,
      receiverId: import_primitives.ObjectId
    })
  ).mutation(async ({ ctx, input }) => {
    const { newStatus, senderId, receiverId } = input;
    const latestRequest = await ctx.prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: import_friendRequest.FriendRequestStatus.enum.PENDING
      },
      orderBy: { createdAt: "desc" }
    });
    if (!latestRequest) {
      throw new import_server3.TRPCError({
        code: "NOT_FOUND",
        message: "No friend request found."
      });
    }
    const updatedRequest = await ctx.prisma.friendRequest.update({
      where: { id: latestRequest.id },
      data: { status: newStatus }
    });
    return updatedRequest;
  })
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  friendRequestRouter
});
//# sourceMappingURL=friendRequest.js.map