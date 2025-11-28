import { tracked, TRPCError } from '@trpc/server';
import { router, profileProcedure } from '../trpc';
import {
  DurationObject,
  ListProfileDTO,
  ObjectId,
  PresenceUpdate,
  z,
} from '@repo/common';
import { DateTime } from 'luxon';
import { eventEmitter } from '@/lib/eventBus';
import { on } from 'events';
import { logger } from '@/lib/pino';

export const onlinePresenceRouter = router({
  // friends who are online or recently online
  getFriendsPresence: profileProcedure
    .input(z.object({ withinLast: DurationObject.optional() }))
    .output(ListProfileDTO.array())
    .query(async ({ ctx, input }) => {
      const withinLast = input.withinLast || { hours: 1 };
      const { user, prisma } = ctx;
      const userProfileId = user?.profile?.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const friendsWithPresence = await prisma.profile.findMany({
        where: {
          friends: {
            some: {
              id: userProfileId,
            },
          },
          OR: [
            { isOnline: true },
            {
              lastOnline: {
                gte: DateTime.now().minus(withinLast).toJSDate(),
              },
            },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          isOnline: true,
          lastOnline: true,
        },
      });

      return friendsWithPresence;
    }),
  // real-time presence updates
  onPresenceChange: profileProcedure.subscription(async function* ({
    ctx,
    signal,
  }) {
    const { user } = ctx;
    const userProfileId = user?.profile?.id;

    if (!userProfileId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    logger.info({ userProfileId }, 'Starting presence update subscription');
    for await (const [presenceUpdate] of on(
      eventEmitter,
      `presenceUpdate:${userProfileId}`,
      { signal }
    )) {
      logger.info({ presenceUpdate }, 'Received presence update');
      const parsedUpdate = PresenceUpdate.safeParse(presenceUpdate);
      if (parsedUpdate.success) {
        logger.info({ parsedUpdate }, 'parsed successfully, yielding');
        yield parsedUpdate.data;
      }
    }
  }),

  onPresenceInChatChange: profileProcedure
    .input(z.object({ chatId: ObjectId }))
    .subscription(async function* ({ input, ctx, signal }) {
      const { chatId } = input;
      const { user, prisma } = ctx;
      const userProfileId = user?.profile?.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const chatWithParticipants = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          participants: {
            select: { id: true },
          },
        },
      });

      if (!chatWithParticipants) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat not found' });
      }

      for await (const [presenceUpdate] of on(
        eventEmitter,
        `presenceUpdate:${userProfileId}`,
        { signal }
      )) {
        // only yield if the changing profile is in the chat
        const profileWithChange = presenceUpdate.profileId;
        const isRelevantToChat = chatWithParticipants.participants.some(
          (p) => p.id === profileWithChange
        );

        if (isRelevantToChat) {
          yield presenceUpdate;
        }
      }
    }),
});
