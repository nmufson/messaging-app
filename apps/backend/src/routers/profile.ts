import { ObjectId } from '@repo/common';
import { router, userProcedure } from '../trpc';
import {
  ProfilePageDTO,
  z,
  CreateProfileInput,
  ListProfileDTO,
  UpdateProfileInput,
} from '@repo/common';

import { TRPCError } from '@trpc/server';

export const profileRouter = router({
  byId: userProcedure
    .input(
      z.object({
        profileId: ObjectId,
      })
    )
    .output(ProfilePageDTO)
    .query(async ({ input, ctx }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { id: input.profileId },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          firstName: true,
          lastName: true,
          profilePictureUrl: true,
          headerPictureUrl: true,
          bio: true,
          _count: {
            select: {
              friends: true,
              chats: true,
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

      return {
        ...profile,
        numOfFriends: profile._count.friends,
        numOfChats: profile._count.chats,
        numOfMessages: profile._count.messages,
      };
    }),
  create: userProcedure
    .input(CreateProfileInput)
    .mutation(async ({ input, ctx }) => {
      const { userId, firstName, lastName, profilePictureUrl } = input;
      const { user } = ctx;
      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      if (userId !== user.id && user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot create this profile.',
        });
      }

      const newProfile = await ctx.prisma.profile.create({
        data: {
          user: { connect: { id: userId } },
          firstName,
          lastName,
          profilePictureUrl,
        },
      });

      return newProfile;
    }),
  update: userProcedure
    .input(UpdateProfileInput)
    .mutation(async ({ input, ctx }) => {
      const { profileId, firstName, lastName, profilePictureUrl } = input;

      const updatedProfile = await ctx.prisma.profile.update({
        where: { id: profileId },
        data: {
          firstName,
          lastName,
          profilePictureUrl,
        },
      });

      return updatedProfile;
    }),
  friends: userProcedure
    .input(z.object({ profileId: ObjectId }))
    .output(z.array(ListProfileDTO))
    .query(async ({ input, ctx }) => {
      const { profileId } = input;

      const profile = await ctx.prisma.profile.findUnique({
        where: { id: profileId },
        select: {
          friends: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
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
});
