import {
  userProcedure
} from "./chunk-ZAYRUBIM.mjs";
import {
  router
} from "./chunk-XI2LZ4T3.mjs";

// src/routers/friendRequest.ts
import { ObjectId } from "@common/schemas/primitives";
import { z } from "@common";
import { FriendRequestStatus } from "@common/schemas/friendRequest";
import { TRPCError } from "@trpc/server";
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
      throw new TRPCError({
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
