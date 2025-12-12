import {
  ListProfileDTO,
  MessageType,
  ObjectId,
  ChatListDTO,
  UpdateChatInput,
  ChatActionDTO,
  ChatActionType,
  CHAT_UPDATE_ACTIONS,
  ChatInfoDTO,
  ChatPreviewDTO,
} from '@repo/common';
import { tracked, TRPCError } from '@trpc/server';
import { on } from 'events';
import { UserRole, z } from '@repo/common';
import { eventEmitter } from '../lib/eventBus';
import { adminProcedure, profileProcedure, router } from '../trpc';
import * as R from 'remeda';
import { mergeAsyncIterators } from '@repo/common';
import { ChatDTO, ChatType } from '@repo/common';
import { logger } from '../lib/pino';
import { getChat, getPotentialChats, updateChatInfo } from '@/services/chat';
import { sendMessage } from '@/services/message';

export const chatRouter = router({
  // TODO: add something for loading more messages in chat
  byId: profileProcedure
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

  findChat: profileProcedure
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
  onNewMessageInChat: profileProcedure
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
  onNewChat: profileProcedure
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
  getList: profileProcedure
    .input(
      z.object({
        limit: z.number().default(100),
      })
    )
    .output(ChatPreviewDTO.array())
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
              // TOOD: only recent the more recent between message and action?
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
                  actorId: true,
                  targetId: true,
                  createdAt: true,
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

      const validatedChats = profile.chats.map((chat) =>
        ChatPreviewDTO.parse(chat)
      );

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
        profiles: ListProfileDTO.array(),
        groupChats: ChatListDTO.array(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { searchNames, requireInput, selectedProfiles } = input;
      const { user } = ctx;

      if (!user || !user?.profile?.id)
        throw new TRPCError({ code: 'UNAUTHORIZED' });

      const { profiles, groupChats } = await getPotentialChats(ctx.prisma, {
        profileId: user.profile.id,
        searchNames,
        requireInput,
        selectedProfiles,
      });

      return { profiles, groupChats };
    }),
  create: profileProcedure
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
            take: 1,
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

      const sender = await ctx.prisma.profile.findUnique({
        where: { id: creator },
      });

      if (!sender) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sender profile not found',
        });
      }

      const createdChatAction = await ctx.prisma.chatAction.create({
        data: {
          chatId: chat.id,
          actionType: 'CHAT_CREATED',
          actorId: creator,
        },
        select: {
          id: true,
          chatId: true,
          actionType: true,
          actorId: true,
          targetId: true,
          createdAt: true,
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

      return { ...chat, actions: [createdChatAction], senders: [sender] };
    }),
  getInfo: profileProcedure
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
          createdAt: true,
          updatedAt: true,
          creatorId: true,
          actions: {
            take: 100,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              chatId: true,
              actionType: true,
              actorId: true,
              targetId: true,
              createdAt: true,
            },
          },
          participants: {
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
      });

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        });
      }

      return chat;
    }),
  updateInfo: profileProcedure
    .input(UpdateChatInput)
    .output(ChatInfoDTO)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updatedFields } = input;
      const { user } = ctx;
      const profileId = user?.profile?.id;

      logger.info(
        { chatId: id, updatedFields, profileId },
        'Updating chat info'
      );

      if (!profileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const updatedChat = await updateChatInfo(ctx.prisma, {
        chatId: id,
        data: updatedFields,
      });

      // TODO: flip the order of these so we can just grab the chat with actions after they're created?

      const actionPromises = R.keys(updatedFields)
        .map((field) => {
          if (field === undefined) return;

          return ctx.prisma.chatAction.create({
            data: {
              chatId: id,
              actionType: CHAT_UPDATE_ACTIONS[field],
              actorId: profileId,
            },
            select: {
              id: true,
              chatId: true,
              actionType: true,
              actorId: true,
              targetId: true,
              createdAt: true,
            },
          });
        })
        .filter((p) => p !== undefined);

      const newActions = await Promise.all(actionPromises);

      logger.info(
        { updatedChat, newActions },
        'Chat info updated successfully'
      );

      return {
        ...updatedChat,
        actions: [...updatedChat.actions, ...newActions],
      };
    }),

  // TODO: move these to new chatActions router?
  addMember: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
        profileId: ObjectId,
      })
    )
    .output(ChatInfoDTO)
    .mutation(async ({ input, ctx }) => {
      const { chatId, profileId: profileIdToAdd } = input;
      const { user } = ctx;

      const addMemberAction = await ctx.prisma.chatAction.create({
        data: {
          chatId: chatId,
          actionType: 'MEMBER_ADDED',
          actorId: user.profile.id,
          targetId: profileIdToAdd,
        },
        select: {
          id: true,
          chatId: true,
          actionType: true,
          actorId: true,
          targetId: true,
          createdAt: true,
        },
      });

      const data = {
        participants: {
          connect: { id: profileIdToAdd },
        },
      };

      const updatedChat = await updateChatInfo(ctx.prisma, {
        chatId,
        data,
      });

      logger.info({ addMemberAction, updatedChat }, 'Added member to chat');

      return updatedChat;
    }),

  removeMember: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
        profileId: ObjectId,
      })
    )
    .output(ChatInfoDTO)
    .mutation(async ({ input, ctx }) => {
      const { chatId, profileId: profileIdToRemove } = input;
      const { user } = ctx;

      const removeMemberAction = await ctx.prisma.chatAction.create({
        data: {
          chatId: chatId,
          actionType: 'MEMBER_REMOVED',
          actorId: user.profile.id,
          targetId: profileIdToRemove,
        },
        select: {
          id: true,
          chatId: true,
          actionType: true,
          actorId: true,
          targetId: true,
          createdAt: true,
        },
      });

      const data = {
        participants: {
          disconnect: { id: profileIdToRemove },
        },
      };

      const updatedChat = await updateChatInfo(ctx.prisma, {
        chatId,
        data,
      });

      logger.info(
        { removeMemberAction, updatedChat },
        'Removed member from chat'
      );

      return updatedChat;
    }),
  leaveChat: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
      })
    )
    .output(ChatInfoDTO)
    .mutation(async ({ input, ctx }) => {
      const { chatId } = input;
      const { user } = ctx;

      const profileIdToLeave = user.profile.id;

      const leaveChatAction = await ctx.prisma.chatAction.create({
        data: {
          chatId: chatId,
          actionType: 'MEMBER_LEFT',
          actorId: profileIdToLeave,
          targetId: profileIdToLeave,
        },
        select: {
          id: true,
          chatId: true,
          actionType: true,
          actorId: true,
          targetId: true,
          createdAt: true,
        },
      });

      const data = {
        participants: {
          disconnect: { id: profileIdToLeave },
        },
      };

      const updatedChat = await updateChatInfo(ctx.prisma, {
        chatId,
        data,
      });

      logger.info({ leaveChatAction, updatedChat }, 'Member left chat');

      return updatedChat;
    }),
});
