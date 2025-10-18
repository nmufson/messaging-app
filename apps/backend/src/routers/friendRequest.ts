import { ObjectId, FriendRequestStatus } from '@repo/common';
import { router, userProcedure } from '../trpc';
import { z } from '@repo/common';
import { TRPCError } from '@trpc/server';

export const friendRequestRouter = router({
  sendNew: userProcedure
    .input(
      z.object({
        senderId: ObjectId,
        receiverId: ObjectId,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { senderId, receiverId } = input;

      const newRequest = ctx.prisma.friendRequest.create({
        data: {
          senderId,
          receiverId,
        },
      });

      return newRequest;
    }),
  update: userProcedure
    .input(
      z.object({
        newStatus: FriendRequestStatus,
        senderId: ObjectId,
        receiverId: ObjectId,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { newStatus, senderId, receiverId } = input;

      const latestRequest = await ctx.prisma.friendRequest.findFirst({
        where: {
          senderId,
          receiverId,
          status: FriendRequestStatus.enum.PENDING,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!latestRequest) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No friend request found.',
        });
      }

      const updatedRequest = await ctx.prisma.friendRequest.update({
        where: { id: latestRequest.id },
        data: { status: newStatus },
      });

      return updatedRequest;
    }),
});
