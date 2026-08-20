import { ObjectId, FriendRequestStatus, FriendRequestDTO } from '@repo/common';
import { router, profileProcedure } from '../trpc';
import { z } from '@repo/common';
import { TRPCError } from '@trpc/server';
import { getFriendRequests } from '@/services/friendRequest';

export const friendRequestRouter = router({
  getRequests: profileProcedure
    .input(
      z.object({
        statuses: FriendRequestStatus.array().optional().default(['PENDING']),
      })
    )
    .output(FriendRequestDTO.array())
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const { statuses } = input;

      const requests = await getFriendRequests(
        ctx.prisma,
        user.profile.id,
        statuses
      );

      return requests;
    }),

  sendRequest: profileProcedure
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
          status: 'PENDING',
        },
      });

      return newRequest;
    }),
  update: profileProcedure
    .input(
      z.object({
        newStatus: FriendRequestStatus,
        senderId: ObjectId,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { newStatus, senderId } = input;
      const { user } = ctx;
      const actionerId = user.profile.id;

      const latestRequest = await ctx.prisma.friendRequest.findFirst({
        where: {
          senderId,
          receiverId: actionerId,
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

      return await ctx.prisma.$transaction(async (tx) => {
        const updatedRequest = await tx.friendRequest.update({
          where: { id: latestRequest.id },
          data: { status: newStatus },
        });

        // If request is accepted, add each profile to the others friends list
        if (newStatus === FriendRequestStatus.enum.ACCEPTED) {
          await tx.profile.update({
            where: { id: actionerId },
            data: { friends: { connect: { id: senderId } } },
          });

          await tx.profile.update({
            where: { id: senderId },
            data: { friends: { connect: { id: actionerId } } },
          });
        }

        return updatedRequest;
      });
    }),
});
