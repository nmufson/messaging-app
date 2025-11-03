import {
  ListProfileDTO,
  MessageType,
  ObjectId,
  ChatListDTO,
} from '@repo/common';
import { tracked, TRPCError } from '@trpc/server';
import { on } from 'events';
import { UserRole, z } from '@repo/common';
import { eventEmitter } from '../lib/eventBus';
import { adminProcedure, router, userProcedure } from '../trpc';
import { mergeAsyncIterators } from '@repo/common';
import { ChatDTO, ChatType } from '@repo/common';
import { logger } from '../lib/pino';
import { getChat, getPotentialChats } from '@/services/chat';

import { sendMessage } from '@/services/message';

export const chatRouter = router({
  // TODO: add something for loading more messages in chat
  byId: userProcedure
    .input(
      z.object({
        chatId: ObjectId,
        limit: z.number().default(100),
        cursor: ObjectId.optional(),
      })
    )
    .output(ChatDTO)
    .query(async ({ ctx, input }) => {
      const { chatId, limit, cursor } = input;

      const chat = await getChat(ctx.prisma, { chatId });

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        });
      }

      const validatedChat = ChatDTO.parse(chat);
      return validatedChat;
    }),

  findChat: userProcedure
    .input(
      z.object({
        chatId: ObjectId.optional(),
        profileIds: ObjectId.array().optional(),
      })
    )
    .output(ChatDTO)
    .query(async ({ ctx, input }) => {
      const { chatId, profileIds } = input;
      const { prisma, user } = ctx;

      const userProfileId = user?.profile?.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      let chat;
      if (chatId) {
        chat = await getChat(prisma, { chatId });
      } else if (profileIds && profileIds.length > 0) {
        chat = await getChat(prisma, {
          profileIds: [...profileIds, userProfileId],
        });
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Must provide either chatId or profileIds',
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
  onNewMessageInChat: userProcedure
    .input(
      z.object({
        profileId: ObjectId,
      })
    )
    // .output(MessageDTO)
    .subscription(async function* ({ input, ctx, signal }) {
      const { profileId } = input;
      const { user } = ctx;

      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const profile = await ctx.prisma.profile.findUnique({
        where: { id: profileId },
        include: {
          chats: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!profile) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const iterables = profile.chats.map(({ id }) =>
        on(eventEmitter, `addMessageToChat:${id}`, { signal })
      );

      for await (const [message] of mergeAsyncIterators(iterables)) {
        logger.info({ message }, 'yielding message');
        if (message.senderId !== user.profile?.id) {
          yield tracked(message.id, message);
        }
      }
    }),
  onNewChat: userProcedure
    .input(
      z.object({
        profileId: ObjectId,
      })
    )
    .subscription(async function* ({ input, ctx, signal }) {
      const { profileId } = input;
      const { user } = ctx;

      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      if (user.id !== profileId && user.role !== UserRole.enum.ADMIN) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      for await (const [newChat] of on(eventEmitter, `newChat:${profileId}`, {
        signal,
      })) {
        yield tracked(newChat.id, newChat);
      }
    }),
  getList: userProcedure
    .input(
      z.object({
        limit: z.number().default(100),
      })
    )
    .output(ChatDTO.array())
    .query(async ({ input, ctx }) => {
      const { limit } = input;
      const { user } = ctx;

      if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });

      // TODO: query the chats directly instead of via profile?
      const profile = await ctx.prisma.profile.findUnique({
        where: { userId: user.id },
        include: {
          chats: {
            take: limit,
            orderBy: { updatedAt: 'desc' },
            include: {
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1, // for displaying most recent msg in list
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

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }
      console.log(profile.chats);
      const validatedChats: ChatDTO[] = profile.chats.map((chat) =>
        ChatDTO.parse(chat)
      );
      // console.log(validatedChats[0].createdAt.isValid);

      return validatedChats;
    }),
  // TODO: move this to an admin router??
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
        orderBy: { updatedAt: 'desc' },
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
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
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
  getPotentialChats: userProcedure
    .input(
      z.object({
        searchNames: z.string().array(),
        selectedProfiles: ObjectId.array().optional(),
      })
    )
    .output(
      z.object({
        profiles: ListProfileDTO.array(),
        groupChats: ChatListDTO.array(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { searchNames, selectedProfiles } = input;
      const { user } = ctx;

      if (!user || !user?.profile?.id)
        throw new TRPCError({ code: 'UNAUTHORIZED' });

      const { profiles, groupChats } = await getPotentialChats(ctx.prisma, {
        profileId: user.profile.id,
        searchNames,
        selectedProfiles,
      });

      return { profiles, groupChats };
    }),
  createChat: userProcedure
    .input(
      z.object({
        creator: ObjectId,
        participants: ObjectId.array(),
        type: ChatType,
        firstMessage: z
          .object({
            type: MessageType,
            content: z.string().nullable(),
            imageUrl: z.string().nullable(),
          })
          .optional(),
      })
    )
    .output(ChatDTO)
    .mutation(async ({ input, ctx }) => {
      const { creator, participants, type, firstMessage } = input;

      const existingChat = await getChat(ctx.prisma, {
        profileIds: participants,
      });

      if (existingChat) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Chat with these participants already exists',
        });
      }

      const chat = await ctx.prisma.chat.create({
        data: {
          creatorId: creator,
          type,
          participants: {
            connect: participants.map((id) => ({ id })),
          },
        },
        include: {
          participants: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          messages: {
            take: 100,
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              type: true,
              content: true,
              createdAt: true,
              updatedAt: true,
              imageUrl: true,
              senderId: true,
            },
          },
        },
      });

      participants.forEach((userId) => {
        eventEmitter.emit(`newChat:${userId}`, chat);
      });

      if (firstMessage) {
        const newMessage = await sendMessage(ctx.prisma, {
          type: firstMessage.type,
          content: firstMessage.content,
          imageUrl: firstMessage.imageUrl,
          sender: creator,
          chatId: chat.id,
        });
      }

      return chat;
    }),
});
