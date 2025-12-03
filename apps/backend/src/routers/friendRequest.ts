import { ObjectId, FriendRequestStatus, FriendRequestDTO } from '@repo/common';
import { router, profileProcedure } from '../trpc';
import { z } from '@repo/common';
import { TRPCError } from '@trpc/server';
import { profile } from 'console';

export const friendRequestRouter = router({
  getPendingRequests: profileProcedure

    .output(FriendRequestDTO.array())
    .query(async ({ ctx, input }) => {
      const { user } = ctx;

      const userProfileId = user.profile.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const pendingRequests = await ctx.prisma.friendRequest.findMany({
        where: {
          receiverId: userProfileId,
          status: FriendRequestStatus.enum.PENDING,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return pendingRequests;
    }),

  // getNotifications: profileProcedure

  //   .output(FriendRequestDTO.array())
  //   .query(async ({ ctx, input }) => {
  //     const { profileId, status } = input;
  //   }),

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

      const updatedRequest = await ctx.prisma.friendRequest.update({
        where: { id: latestRequest.id },
        data: { status: newStatus },
      });

      return updatedRequest;
    }),
});
