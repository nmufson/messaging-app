import { ObjectId, z } from '@repo/common';
import { router } from './init';
import { publicProcedure } from './procedures';
import { eventEmitter } from '@/lib/eventBus';

export const debugRouter = router({
  setOnlineStatus: publicProcedure
    .input(
      z.object({
        profileId: ObjectId,
        isOnline: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { profileId, isOnline } = input;
      await ctx.prisma.profile.update({
        where: { id: profileId },
        data: {
          isOnline: isOnline,
          lastOnline: isOnline ? undefined : new Date(),
        },
      });

      const updatedProfile = await ctx.prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          friends: {
            select: { id: true },
          },
        },
      });

      if (updatedProfile) {
        const payload = {
          id: profileId,
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
          avatarUrl: updatedProfile.avatarUrl,
          isOnline,
          lastOnline: isOnline ? null : new Date(),
        };

        // Notify friends about presence change
        updatedProfile.friends.forEach((friend) => {
          eventEmitter.emit(`presenceUpdate:${friend.id}`, payload);
        });
      }

      return {
        success: true,
        profileId,
        isOnline,
      };
    }),
});
