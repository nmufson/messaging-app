import { logger } from '@/lib/pino';
import {
  BaseProfileDTO,
  CreateProfileInput,
  ObjectId,
  ProfileDTO,
  ProfilePageDTO,
  UpdateProfileInput,
  z,
} from '@repo/common';
import { TRPCError } from '@trpc/server';
import * as R from 'remeda';
import { profileProcedure, router, userProcedure } from '../trpc';
import { nameEmailSearch } from '@/services/profile';

export const profileRouter = router({
  byId: profileProcedure
    .input(
      z.object({
        profileId: ObjectId,
      })
    )
    .output(ProfilePageDTO)
    .query(async ({ input, ctx }) => {
      const { user } = ctx;

      const profile = await ctx.prisma.profile.findUnique({
        where: { id: input.profileId },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          headerUrl: true,
          title: true,
          bio: true,
          _count: {
            select: {
              friends: true,
              chatMemberships: true,
              messages: true,
            },
          },
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const pendingFriendRequestFromMe =
        await ctx.prisma.friendRequest.findFirst({
          where: {
            senderId: user.profile.id,
            receiverId: input.profileId,
            status: 'PENDING',
          },
        });

      const pendingFriendRequestForMe =
        await ctx.prisma.friendRequest.findFirst({
          where: {
            senderId: input.profileId,
            receiverId: user.profile.id,
            status: 'PENDING',
          },
        });

      return {
        ...profile,
        numOfFriends: profile._count.friends,
        numOfChats: profile._count.chatMemberships,
        numOfMessages: profile._count.messages,
        hasPendingFriendRequestFromMe: R.isTruthy(pendingFriendRequestFromMe),
        hasPendingFriendRequestForMe: R.isTruthy(pendingFriendRequestForMe),
      };
    }),

  create: userProcedure
    .input(CreateProfileInput)
    .mutation(async ({ input, ctx }) => {
      const { firstName, lastName, avatarUrl, headerUrl, bio } = input;
      const { user } = ctx;

      const newProfile = await ctx.prisma.profile.create({
        data: {
          user: { connect: { id: user.id } },
          firstName,
          lastName,
          avatarUrl,
          headerUrl,
          bio,
        },
      });

      if (!newProfile) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create profile',
        });
      }

      logger.info({ newProfile }, 'Created new profile successfully');

      return newProfile;
    }),

  update: profileProcedure
    .input(UpdateProfileInput)
    .output(ProfileDTO)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updatedFields } = input;
      const { user } = ctx;
      logger.info({ input }, 'Updating profile');
      if (user.profile.id !== id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own profile',
        });
      }

      const updatedProfile = await ctx.prisma.profile.update({
        where: { id },
        data: {
          ...updatedFields,
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          headerUrl: true,
          title: true,
          bio: true,
        },
      });

      return {
        ...updatedProfile,
      };
    }),

  friends: profileProcedure
    .input(
      z.object({ profileId: ObjectId, searchInput: z.string().optional() })
    )
    .output(BaseProfileDTO.array())
    .query(async ({ input, ctx }) => {
      const { profileId, searchInput } = input;

      const profile = await ctx.prisma.profile.findUnique({
        where: {
          id: profileId,
        },
        select: {
          friends: {
            where: searchInput ? nameEmailSearch(searchInput) : undefined,
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      return profile.friends;
    }),
  nonFriends: profileProcedure
    .input(z.object({ searchInput: z.string() }))
    .output(BaseProfileDTO.array())
    .query(async ({ input, ctx }) => {
      const { searchInput } = input;
      const { user } = ctx;
      const profileId = user.profile.id;

      const loggedInProfile = await ctx.prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          friends: {
            select: { id: true },
          },
        },
      });

      if (!loggedInProfile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Logged in profile not found',
        });
      }

      const profiles = await ctx.prisma.profile.findMany({
        where: {
          id: { not: profileId },
          AND: [
            // not already a friend
            {
              NOT: {
                id: { in: loggedInProfile.friends.map((f) => f.id) },
              },
            },
            searchInput ? nameEmailSearch(searchInput) : {},
          ],
        },
        orderBy: [
          { isOnline: 'desc' },
          { lastOnline: { sort: 'desc', nulls: 'last' } },
        ],
      });

      return profiles;
    }),
});
