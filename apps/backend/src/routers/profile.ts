import { logger } from '@/lib/pino';
import {
  BaseProfileDTO,
  CreateProfileInput,
  ObjectId,
  ProfileDTO,
  ProfilePageDTO,
  RelationshipToViewer,
  UpdateProfileInput,
  z,
} from '@repo/common';
import { TRPCError } from '@trpc/server';
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
      const viewerProfileId = user.profile.id;

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
          friends: {
            select: {
              id: true,
            },
          },
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

      const isSelf = input.profileId === viewerProfileId;
      const isFriend = isSelf
        ? false
        : profile.friends.some(({ id }) => id === viewerProfileId);

      let pendingFriendRequest = null;
      if (!isSelf && !isFriend) {
        pendingFriendRequest = await ctx.prisma.friendRequest.findFirst({
          where: {
            status: 'PENDING',
            OR: [
              {
                senderId: viewerProfileId,
                receiverId: input.profileId,
              },
              {
                senderId: input.profileId,
                receiverId: viewerProfileId,
              },
            ],
          },
          select: {
            senderId: true,
            receiverId: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
      }

      let relationshipToViewer: RelationshipToViewer = 'NONE';

      if (isSelf) {
        relationshipToViewer = 'SELF';
      } else if (isFriend) {
        relationshipToViewer = 'FRIEND';
      } else if (pendingFriendRequest?.senderId === viewerProfileId) {
        relationshipToViewer = 'PENDING_OUTGOING_REQUEST';
      } else if (pendingFriendRequest?.receiverId === viewerProfileId) {
        relationshipToViewer = 'PENDING_INCOMING_REQUEST';
      }

      const { friends, ...ProfileDTO } = profile;

      return {
        ...ProfileDTO,
        numOfFriends: profile._count.friends,
        numOfChats: profile._count.chatMemberships,
        numOfMessages: profile._count.messages,
        relationshipToViewer,
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

  removeFriend: profileProcedure
    .input(
      z.object({
        friendProfileId: ObjectId,
      })
    )
    .output(
      z.object({
        removedFriendProfileId: ObjectId,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const viewerProfileId = ctx.user.profile.id;
      const { friendProfileId } = input;

      if (viewerProfileId === friendProfileId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot remove yourself as a friend.',
        });
      }

      const relationship = await ctx.prisma.profile.findFirst({
        where: {
          id: viewerProfileId,
          friends: {
            some: {
              id: friendProfileId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (!relationship) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Friend relationship not found.',
        });
      }

      await ctx.prisma.profile.update({
        where: {
          id: viewerProfileId,
        },
        data: {
          friends: {
            disconnect: {
              id: friendProfileId,
            },
          },
        },
      });

      return {
        removedFriendProfileId: friendProfileId,
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
