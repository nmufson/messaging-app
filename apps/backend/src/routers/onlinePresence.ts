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
    .input(
      z
        .object({
          chatId: ObjectId.optional(),
          withinLast: DurationObject.optional().default({ hours: 1 }),
        })
        .optional()
    )
    .output(ListProfileDTO.array())
    .query(async ({ ctx, input }) => {
      const { chatId, withinLast } = input || {};
      const { user, prisma } = ctx;
      const userProfileId = user?.profile?.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const friendsWithPresence = await prisma.profile.findMany({
        where: {
          AND: [
            {
              id: { not: userProfileId },
            },
            {
              OR: [
                {
                  friends: {
                    some: {
                      id: userProfileId,
                    },
                  },
                },
                ...(chatId
                  ? [
                      {
                        chats: {
                          some: {
                            id: chatId,
                          },
                        },
                      },
                    ]
                  : []),
              ],
            },
            {
              OR: [
                { isOnline: true },
                {
                  lastOnline: {
                    gte: DateTime.now()
                      .minus(withinLast || { hours: 1 })
                      .toJSDate(),
                  },
                },
              ],
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
  onPresenceChange: profileProcedure
    .input(z.object({}))
    .subscription(async function* ({ ctx, signal }) {
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

      const profileWithChats = await prisma.profile.findUnique({
        where: { id: userProfileId },
        include: {
          chats: {
            select: { id: true },
          },
        },
      });

      if (!profileWithChats) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const isMember = profileWithChats.chats.some((c) => c.id === chatId);
      if (!isMember) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You are not a member of this chat',
        });
      }

      for await (const [presenceUpdate] of on(
        eventEmitter,
        `presenceInChatUpdate:${chatId}`,
        { signal }
      )) {
        yield presenceUpdate;
      }
    }),
});
