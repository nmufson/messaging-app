import { eventEmitter } from '@/lib/eventBus';
import { logger } from '@/lib/pino';
import {
  BaseProfileDTO,
  DurationObject,
  ObjectId,
  PresenceUpdate,
  z,
} from '@repo/common';
import { TRPCError } from '@trpc/server';
import { on } from 'events';
import { DateTime } from 'luxon';
import { profileProcedure, router } from '../trpc';

export const onlinePresenceRouter = router({
  // profiles who are online or recently online
  profilesPresence: profileProcedure
    .input(
      z
        .object({
          chatId: ObjectId.optional(),
          withinLast: DurationObject.optional().default({ hours: 1 }),
          friendsOnly: z.boolean().optional().default(false),
        })
        .optional()
    )
    .output(BaseProfileDTO.array())
    .query(async ({ ctx, input }) => {
      const { chatId, withinLast, friendsOnly = false } = input || {};
      const { user, prisma } = ctx;
      const userProfileId = user?.profile?.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const scopeFilter =
        friendsOnly || !chatId
          ? {
              friends: {
                some: {
                  id: userProfileId,
                },
              },
            }
          : {
              chatMemberships: {
                some: {
                  chatId,
                },
              },
            };

      const profilesWithPresence = await prisma.profile.findMany({
        where: {
          AND: [
            {
              id: { not: userProfileId },
            },
            scopeFilter,
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

      return profilesWithPresence;
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
          chatMemberships: {
            select: {
              chatId: true,
            },
          },
        },
      });

      if (!profileWithChats) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      const isMember = profileWithChats.chatMemberships.some(
        (c) => c.chatId === chatId
      );
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
