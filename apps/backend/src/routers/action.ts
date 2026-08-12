import { eventEmitter } from '@/lib/eventBus';
import { CHAT_INFO_SELECT, getChat } from '@/services/chat';
import { getMergedActivities } from '@/services/activity';
import { createAction } from '@/services/action';
import { sendMessage } from '@/services/message';
import { router } from '@/trpc';
import {
  ActionOutputDTO,
  CHAT_UPDATE_ACTIONS,
  ChatDTO,
  ChatType,
  MessageType,
  ObjectId,
  UpdateChatInput,
  z,
} from '@repo/common';
import { TRPCError } from '@trpc/server';
import { logger } from '../lib/pino';
import { profileProcedure } from '../trpc';

export const actionRouter = router({
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

      const updatedChat = await ctx.prisma.chat.update({
        where: { id },
        data: updatedFields,
        select: CHAT_INFO_SELECT,
      });

      // only one field will be updated at a time
      const updatedField = updatedFields.name ? 'name' : 'groupPictureUrl';
      const actionType = CHAT_UPDATE_ACTIONS[updatedField];

      const actionData = {
        chatId: id,
        actionType,
        actorId: profileId,
      };

      // TODO: move this within updateChatInfo ?
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

      // Keep membership idempotent in case the profile is already in the chat.
      const chatParticipant = await ctx.prisma.chatParticipant.upsert({
        where: {
          chatId_profileId: {
            chatId,
            profileId: profileIdToAdd,
          },
        },
        update: {},
        create: {
          chatId,
          profileId: profileIdToAdd,
        },
      });

      logger.info(
        { chatParticipant, chatId, profileIdToAdd },
        'Added member to chat'
      );

      const updatedChat = await ctx.prisma.chat.findUnique({
        where: { id: chatId },
        select: CHAT_INFO_SELECT,
      });

      if (!updatedChat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        });
      }

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

      const updatedChat = await ctx.prisma.chat.update({
        where: { id: chatId },
        data: {
          participants: {
            delete: {
              chatId_profileId: {
                chatId,
                profileId: profileIdToRemove,
              },
            },
          },
        },
        select: CHAT_INFO_SELECT,
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

      const updatedChat = await ctx.prisma.chat.update({
        where: { id: chatId },
        data: {
          participants: {
            delete: {
              chatId_profileId: {
                chatId,
                profileId: profileIdToLeave,
              },
            },
          },
        },
        select: CHAT_INFO_SELECT,
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
  createChat: profileProcedure
    .input(
      z.object({
        creatorId: ObjectId,
        participantProfileIds: ObjectId.array(),
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
      const { creatorId, participantProfileIds, type, firstMessage } = input;

      const existingChat = await getChat(ctx.prisma, {
        participantProfileIds: participantProfileIds,
      });

      if (existingChat) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Chat with these participants already exists',
        });
      }

      const newChat = await ctx.prisma.$transaction(async (trx) => {
        const createdChat = await trx.chat.create({
          data: { creatorId, type },
        });

        await trx.chatParticipant.createMany({
          data: participantProfileIds.map((profileId) => ({
            chatId: createdChat.id,
            profileId,
          })),
        });

        return trx.chat.findUniqueOrThrow({
          where: { id: createdChat.id },
          include: {
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
      });

      const createdChatAction = await ctx.prisma.chatAction.create({
        data: {
          chatId: newChat.id,
          actionType: 'CHAT_CREATED',
          actorId: creatorId,
        },
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
      });

      participantProfileIds.forEach((profileId) => {
        if (profileId === creatorId) return;
        eventEmitter.emit(`chat:created:${profileId}`, newChat);
      });

      let newMessage;
      if (firstMessage) {
        newMessage = await sendMessage(ctx.prisma, {
          type: firstMessage.type,
          content: firstMessage.content,
          imageUrl: firstMessage.imageUrl,
          senderId: creatorId,
          chatId: newChat.id,
        });
      }

      const mergedActivities = await getMergedActivities(
        newMessage ? [newMessage] : [],
        [createdChatAction]
      );

      const chatWithActivities = {
        ...newChat,
        activities: mergedActivities,
      };

      return chatWithActivities;
    }),
});
