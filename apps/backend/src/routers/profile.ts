import { ObjectId } from '@common/schemas/primitives';
import { router, userProcedure } from '../trpc';
import { z } from '@common';
import {
  CreateProfileInput,
  UpdateProfileInput,
} from '@common/schemas/profile';
import { TRPCBuilder, TRPCError } from '@trpc/server';

export const profileRouter = router({
  byId: userProcedure
    .input(
      z.object({
        profileId: ObjectId,
      })
    )
    .query(async ({ input, ctx }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { id: input.profileId },
      });
      return profile;
    }),
  create: userProcedure
    .input(CreateProfileInput)
    .mutation(async ({ input, ctx }) => {
      const { userId, firstName, lastName, profilePictureUrl } = input;
      const { user } = ctx;

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
  getFriends: userProcedure
    .input(z.object({ profileId: ObjectId }))
    .query(async ({ input, ctx }) => {
      const { profileId } = input;

      const friends = await ctx.prisma.profile.findUnique({
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

      return friends;
    }),
});
