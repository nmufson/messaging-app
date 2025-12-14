import {
  createAction,
  getChat,
  getMergedActivities,
  getPotentialChats,
  updateChatInfo,
} from '@/services/chat';
import { sendMessage } from '@/services/message';
import {
  ActionOutputDTO,
  CHAT_UPDATE_ACTIONS,
  ChatDTO,
  ChatInfoDTO,
  ChatListDTO,
  ChatPreviewDTO,
  ChatType,
  ListProfileDTO,
  mergeAsyncIterators,
  MessageType,
  ObjectId,
  UpdateChatInput,
  UserRole,
  z,
} from '@repo/common';
import { tracked, TRPCError } from '@trpc/server';
import { on } from 'events';
import { eventEmitter } from '../lib/eventBus';
import { logger } from '../lib/pino';
import { adminProcedure, profileProcedure, router } from '../trpc';

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
          profileIds: [...profileIds, userProfileId],
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
      const profileId = user.profile.id;

      const chats = await ctx.prisma.chat.findMany({
        where: {
          participants: {
            some: { id: profileId },
          },
        },
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
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
              targetId: true,
              createdAt: true,
              content: true,
              actor: {
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
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
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

      const validatedChats = chats.map((chat) => {
        return ChatPreviewDTO.parse(chat);
      });

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

      let messages = [];
      if (firstMessage) {
        const newMessage = await sendMessage(ctx.prisma, {
          type: firstMessage.type,
          content: firstMessage.content,
          imageUrl: firstMessage.imageUrl,
          sender: creator,
          chatId: chat.id,
        });
        messages.push(newMessage);
      }

      const { mergedActivities, activityProfiles } = await getMergedActivities(
        messages,
        [createdChatAction]
      );

      const fullChat = {
        ...chat,
        messages,
        actions: [createdChatAction],
        activities: mergedActivities,
        activityProfiles,
      };

      return fullChat;
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
    .output(ActionOutputDTO)
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

      // only one field will be updated at a time
      const updatedField = updatedFields.name ? 'name' : 'groupPictureUrl';
      const actionType = CHAT_UPDATE_ACTIONS[updatedField];

      const actionData = {
        chatId: id,
        actionType,
        actorId: profileId,
        ...(actionType === 'NAME_CHANGED' && {
          content: updatedFields.name,
        }),
      };

      const { newActionActivity, activityProfiles } = await createAction(
        ctx.prisma,
        actionData
      );

      logger.info(
        { updatedChat, newActionActivity },
        'Chat info updated successfully'
      );

      return {
        updatedChat,
        newActionActivity,
        activityProfiles,
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
    .output(ActionOutputDTO)
    .mutation(async ({ input, ctx }) => {
      const { chatId, profileId: profileIdToAdd } = input;
      const { user } = ctx;

      const data = {
        participants: {
          connect: { id: profileIdToAdd },
        },
      };

      const updatedChat = await updateChatInfo(ctx.prisma, {
        chatId,
        data,
      });

      const actionData = {
        chatId: chatId,
        actionType: 'MEMBER_ADDED' as const,
        actorId: user.profile.id,
        targetId: profileIdToAdd,
      };

      const { newActionActivity, activityProfiles } = await createAction(
        ctx.prisma,
        actionData
      );

      logger.info({ newActionActivity, updatedChat }, 'Added member to chat');

      return {
        updatedChat,
        newActionActivity,
        activityProfiles,
      };
    }),

  removeMember: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
        profileId: ObjectId,
      })
    )
    .output(ActionOutputDTO)
    .mutation(async ({ input, ctx }) => {
      const { chatId, profileId: profileIdToRemove } = input;
      const { user } = ctx;

      const updateChatData = {
        participants: {
          disconnect: { id: profileIdToRemove },
        },
      };

      const updatedChat = await updateChatInfo(ctx.prisma, {
        chatId,
        data: updateChatData,
      });

      const removeMemberActionData = {
        chatId: chatId,
        actionType: 'MEMBER_REMOVED' as const,
        actorId: user.profile.id,
        targetId: profileIdToRemove,
      };

      const { newActionActivity, activityProfiles } = await createAction(
        ctx.prisma,
        removeMemberActionData
      );

      logger.info(
        { newActionActivity, updatedChat },
        'Removed member from chat'
      );

      return {
        updatedChat,
        newActionActivity,
        activityProfiles,
      };
    }),
  leaveChat: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
      })
    )
    .output(ActionOutputDTO)
    .mutation(async ({ input, ctx }) => {
      const { chatId } = input;
      const { user } = ctx;

      const profileIdToLeave = user.profile.id;

      const updateChatData = {
        participants: {
          disconnect: { id: profileIdToLeave },
        },
      };

      const updatedChat = await updateChatInfo(ctx.prisma, {
        chatId,
        data: updateChatData,
      });

      const leaveChatActionData = {
        chatId: chatId,
        actionType: 'MEMBER_LEFT' as const,
        actorId: profileIdToLeave,
      };

      const { newActionActivity, activityProfiles } = await createAction(
        ctx.prisma,
        leaveChatActionData
      );

      logger.info({ newActionActivity, updatedChat }, 'Member left chat');

      return {
        updatedChat,
        newActionActivity,
        activityProfiles,
      };
    }),
});
