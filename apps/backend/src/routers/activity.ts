import { logger } from '@/lib/pino';
import { getMergedActivities } from '@/services/activity';
import { getChatActivities } from '@/services/activity';
import {
  checkIsActivityCreator,
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
      const { user } = ctx;
      const { cursor, chatId } = input;
      const loggedInProfileId = user.profile.id;

      if (cursor) {
        const { lastActivityTime, lastActivityId } = cursor;

        const whereFilters = {
          chatId,
          createdAt: { gt: lastActivityTime.toJSDate() },
          NOT: { id: lastActivityId },
        };
        const missedMessages = await ctx.prisma.message.findMany({
          where: whereFilters,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        const missedActions = await ctx.prisma.chatAction.findMany({
          where: whereFilters,
          select: {
            id: true,
            chatId: true,
            actionType: true,
            actorId: true,
            targetId: true,
            createdAt: true,
            actor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            target: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        const missedActivities = await getMergedActivities(
          missedMessages,
          missedActions
        );

        const parsedActivities =
          ChatActivityDTO.array().parse(missedActivities);
        for (const activity of parsedActivities) {
          logger.info({ missedActivities }, 'Yielding missed activities');

          const isCreatedByLoggedInUser = checkIsActivityCreator(
            loggedInProfileId,
            activity
          );
          if (isCreatedByLoggedInUser) return;

          yield tracked(activity.id, activity);
        }
      }

      for await (const [activity] of on(
        eventEmitter,
        `activity:create:${chatId}`,
        {
          signal,
        }
      )) {
        const parsedActivity = ChatActivityDTO.parse(activity);
        const isCreatedByLoggedInUser = checkIsActivityCreator(
          loggedInProfileId,
          activity
        );
        if (isCreatedByLoggedInUser) return;

        logger.info({ activity: parsedActivity }, 'Yielding activity');

        yield tracked(parsedActivity.id, parsedActivity);
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
        on(eventEmitter, `activity:create:${chatId}`, { signal })
      );

      for await (const [activity] of mergeAsyncIterators(iterables)) {
        const taggedActivity = tagActivity(activity, activity.activityType);
        const parsedActivity = ChatActivityDTO.parse(taggedActivity);

        logger.info({ messageActivity: parsedActivity }, 'Yielding activity');
        yield tracked(parsedActivity.id, parsedActivity);
      }
    }),
});
