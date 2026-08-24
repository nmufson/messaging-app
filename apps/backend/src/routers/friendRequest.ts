import { ObjectId, FriendRequestStatus, FriendRequestDTO } from '@repo/common';
import { router, profileProcedure } from '../trpc';
import { z } from '@repo/common';
import { TRPCError } from '@trpc/server';
import { getFriendRequests } from '@/services/friendRequest';

const incomingUpdateStatus = z.enum([
  FriendRequestStatus.enum.ACCEPTED,
  FriendRequestStatus.enum.DECLINED,
]);

export const friendRequestRouter = router({
  list: profileProcedure
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
        receiverId: ObjectId,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const senderId = ctx.user.profile.id;
      const { receiverId } = input;

      if (!senderId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Profile required',
        });
      }

      if (senderId === receiverId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot send a friend request to yourself.',
        });
      }

      const newRequest = await ctx.prisma.friendRequest.create({
        data: {
          senderId,
          receiverId,
          status: 'PENDING',
        },
      });

      return newRequest;
    }),
  respondToIncoming: profileProcedure
    .input(
      z.object({
        newStatus: incomingUpdateStatus,
        senderId: ObjectId,
      })
    )
    .output(FriendRequestDTO)
    .mutation(async ({ ctx, input }) => {
      const receiverId = ctx.user.profile.id;
      const { newStatus, senderId } = input;

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

      return await ctx.prisma.$transaction(async (tx) => {
        const updatedRequest = await tx.friendRequest.update({
          where: { id: latestRequest.id },
          data: { status: newStatus },
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
        });

        // If request is accepted, add each profile to the others friends list
        if (newStatus === FriendRequestStatus.enum.ACCEPTED) {
          await tx.profile.update({
            where: { id: receiverId },
            data: { friends: { connect: { id: senderId } } },
          });

          await tx.profile.update({
            where: { id: senderId },
            data: { friends: { connect: { id: receiverId } } },
          });
        }

        return updatedRequest;
      });
    }),

  cancelOutgoing: profileProcedure
    .input(
      z.object({
        receiverId: ObjectId,
      })
    )
    .output(FriendRequestDTO)
    .mutation(async ({ ctx, input }) => {
      const senderId = ctx.user.profile.id;
      const { receiverId } = input;

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
          message: 'No outgoing friend request found.',
        });
      }

      const updatedRequest = await ctx.prisma.friendRequest.update({
        where: { id: latestRequest.id },
        data: { status: FriendRequestStatus.enum.CANCELLED },
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
      });

      return updatedRequest;
    }),
});
