import { logger } from '@/lib/pino';
import { getChatActivities, getMergedActivities } from '@/services/chat';
import {
  DateTimeSchema,
  mergeAsyncIterators,
  ObjectId,
  tagActivity,
  z,
} from '@repo/common';
import {
  ActivitiesQueryOptions,
  ChatActivityDTO,
} from '@repo/common/schemas/activities';
import { tracked, TRPCError } from '@trpc/server';
import { on } from 'events';
import { eventEmitter } from '../lib/eventBus';
import { profileProcedure, router } from '../trpc';

export const activityRouter = router({
  getActivities: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
        cursor: DateTimeSchema.optional(),
        options: ActivitiesQueryOptions.optional(),
      })
    )
    .output(
      z.object({
        activities: ChatActivityDTO.array(),
        nextCursor: z.date().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { chatId, cursor, options } = input;
      return getChatActivities(ctx.prisma, { chatId, cursor }, options);
    }),
  onNewActivity: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
        cursor: z
          .object({
            lastActivityTime: DateTimeSchema,
            lastActivityId: ObjectId,
          })
          .nullish(),
      })
    )
    .subscription(async function* ({ input, ctx, signal }) {
      const { cursor, chatId } = input;

      if (cursor) {
        const { lastActivityTime, lastActivityId } = cursor;

        const whereFilters = {
          chatId,
          createdAt: { gt: lastActivityTime.toJSDate() },
          NOT: { id: lastActivityId },
        };
        const missedMessages = await ctx.prisma.message.findMany({
          where: whereFilters,
          orderBy: { createdAt: 'asc' },
        });

        const missedActions = await ctx.prisma.chatAction.findMany({
          where: whereFilters,
          orderBy: { createdAt: 'asc' },
        });

        const missedActivities = await getMergedActivities(
          missedMessages,
          missedActions
        );

        logger.info({ missedActivities }, 'Yielding missed activities');

        for (const activity of missedActivities) {
          yield tracked(activity.id, activity);
        }
      }

      for await (const [activity] of on(
        eventEmitter,
        `addActivityToChat:${chatId}`,
        {
          signal,
        }
      )) {
        logger.info({ activity }, 'Yielding activity');
        yield tracked(activity.id, activity);
      }
    }),
  onNewActivityInChatList: profileProcedure
    .input(
      z.object({
        profileId: ObjectId,
      })
    )
    .subscription(async function* ({ input, ctx, signal }) {
      const { profileId } = input;
      const { user } = ctx;
      // const userProfileId = user.profile.id;

      const profile = await ctx.prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          chatMemberships: {
            select: { chatId: true },
          },
        },
      });

      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const iterables = profile.chatMemberships.map(({ chatId }) =>
        on(eventEmitter, `addActivityToChat:${chatId}`, { signal })
      );

      for await (const [activity] of mergeAsyncIterators(iterables)) {
        const taggedActivity = tagActivity(activity, activity.activityType);
        const parsedActivity = ChatActivityDTO.parse(taggedActivity);

        logger.info({ messageActivity: parsedActivity }, 'Yielding activity');
        yield tracked(parsedActivity.id, parsedActivity);
      }
    }),
  onNewChatAction: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
        lastMessageId: ObjectId.nullish(),
      })
    )
    .subscription(async function* ({ input, ctx, signal }) {}),
});
