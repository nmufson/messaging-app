import { getChat, getPotentialChats } from '@/services/chat';
import { getMergedActivities } from '@/services/activity';
import {
  BaseProfileDTO,
  ChatDTO,
  ChatInfoDTO,
  ChatListItemDTO,
  ObjectId,
  z,
} from '@repo/common';
import { tracked, TRPCError } from '@trpc/server';
import { on } from 'events';
import { eventEmitter } from '../lib/eventBus';
import { logger } from '../lib/pino';
import { adminProcedure, profileProcedure, router } from '../trpc';

export const chatRouter = router({
  byId: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
      })
    )
    .output(ChatInfoDTO)
    .query(async ({ ctx, input }) => {
      const { chatId } = input;

      const chat = await getChat(ctx.prisma, { chatId });

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        });
      }

      return chat;
    }),

  findChat: profileProcedure
    .input(
      z.object({
        chatId: ObjectId.optional(),
        profileIds: ObjectId.array().optional(),
      })
    )
    .output(ChatInfoDTO)
    .query(async ({ ctx, input }) => {
      const { chatId, profileIds } = input;
      const { prisma, user } = ctx;

      const userProfileId = user?.profile?.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      if (!chatId && (!profileIds || profileIds.length === 0)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Must provide chatId or profileIds',
        });
      }

      let chat;
      if (chatId) {
        chat = await getChat(prisma, { chatId });
      } else if (profileIds && profileIds.length > 0) {
        chat = await getChat(prisma, {
          participantProfileIds: [...profileIds, userProfileId],
        });
      }

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        });
      }
      return chat;
    }),

  onNewChat: profileProcedure.subscription(async function* ({ ctx, signal }) {
    const { user } = ctx;
    const userProfileId = user.profile.id;

    for await (const [newChat] of on(
      eventEmitter,
      `chat:created:${userProfileId}`,
      {
        signal,
      }
    )) {
      yield tracked(newChat.id, newChat);
    }
  }),
  list: profileProcedure
    .input(
      z.object({
        limit: z.number().default(100),
      })
    )
    .output(ChatDTO.array())
    .query(async ({ input, ctx }) => {
      const { limit } = input;
      const { user } = ctx;
      const profileId = user.profile.id;

      const chats = await ctx.prisma.chat.findMany({
        where: {
          participants: {
            some: {
              profileId,
            },
          },
        },
        // TODO: can use unit pagination w cursor here
        take: limit,
        orderBy: { lastActivityAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              chatId: true,
              type: true,
              content: true,
              imageUrl: true,
              createdAt: true,
              updatedAt: true,
              senderId: true,
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          actions: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              chatId: true,
              actionType: true,
              targetId: true,
              createdAt: true,
              actorId: true,
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
          },
          participants: {
            select: {
              lastViewedAt: true,
              unreadActivities: true,
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });

      if (!chats) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chats not found',
        });
      }

      const chatsWithActivities = await Promise.all(
        chats.map(async (chat) => {
          const activities = await getMergedActivities(
            chat.messages,
            chat.actions
          );
          return {
            ...chat,
            activities,
          };
        })
      );

      return chatsWithActivities;
    }),
  getAll: adminProcedure
    .input(
      z.object({
        limit: z.number().default(100),
      })
    )
    .output(ChatDTO.array())
    .query(async ({ ctx }) => {
      logger.info('Requesting all chats');

      const chats = await ctx.prisma.chat.findMany({
        orderBy: { lastActivityAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // display most recent msg in preview
            select: {
              id: true,
              type: true,
              content: true,
              imageUrl: true,
              createdAt: true,
              updatedAt: true,
              senderId: true,
            },
          },
          participants: {
            select: {
              lastViewedAt: true,
              unreadActivities: true,
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });
      logger.info({ chats }, 'Queried all chats');

      const validatedChats: ChatDTO[] = chats.map((chat) =>
        ChatDTO.parse(chat)
      );
      return validatedChats;
    }),
  getPotentialChats: profileProcedure
    .input(
      z.object({
        searchNames: z.string().array(),
        requireInput: z.boolean().optional(),
        selectedProfiles: ObjectId.array().optional(),
      })
    )
    .output(
      z.object({
        profiles: BaseProfileDTO.array(),
        groupChats: ChatListItemDTO.array(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { searchNames, requireInput, selectedProfiles } = input;
      const { user } = ctx;

      const { profiles, groupChats } = await getPotentialChats(ctx.prisma, {
        profileId: user.profile.id,
        searchNames,
        requireInput,
        selectedProfiles,
      });

      return { profiles, groupChats };
    }),

  info: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
      })
    )
    .output(ChatInfoDTO)
    .query(async ({ input, ctx }) => {
      const { chatId } = input;

      const chat = await ctx.prisma.chat.findUnique({
        where: { id: chatId },
        select: {
          id: true,
          type: true,
          name: true,
          groupPictureUrl: true,
          lastActivityAt: true,
          createdAt: true,
          updatedAt: true,
          creatorId: true,
          participants: {
            orderBy: {
              profile: {
                isOnline: 'desc',
              },
            },
            select: {
              lastViewedAt: true,
              unreadActivities: true,
              profile: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  isOnline: true,
                  lastOnline: true,
                },
              },
            },
          },
        },
      });

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        });
      }

      return chat;
    }),
});
