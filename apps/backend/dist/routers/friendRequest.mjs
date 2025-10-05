// src/routers/friendRequest.ts
import { ObjectId } from "@common/schemas/primitives";

// src/trpc/context.ts
import { prisma } from "@db";

// src/trpc/init.ts
import { initTRPC } from "@trpc/server";
var t = initTRPC.context().create();
var router = t.router;

// src/trpc/middleware.ts
import { TRPCError } from "@trpc/server";
var isAuthed = t.middleware(
  ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }
);
var isAdmin = t.middleware(
  ({ ctx, next }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new TRPCError({
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
import { z } from "@common";
import { FriendRequestStatus } from "@common/schemas/friendRequest";
import { TRPCError as TRPCError2 } from "@trpc/server";
var friendRequestRouter = router({
  sendNew: userProcedure.input(
    z.object({
      senderId: ObjectId,
      receiverId: ObjectId
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
    z.object({
      newStatus: FriendRequestStatus,
      senderId: ObjectId,
      receiverId: ObjectId
    })
  ).mutation(async ({ ctx, input }) => {
    const { newStatus, senderId, receiverId } = input;
    const latestRequest = await ctx.prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: FriendRequestStatus.enum.PENDING
      },
      orderBy: { createdAt: "desc" }
    });
    if (!latestRequest) {
      throw new TRPCError2({
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
export {
  friendRequestRouter
};
//# sourceMappingURL=friendRequest.mjs.map