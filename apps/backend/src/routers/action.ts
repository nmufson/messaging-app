import { eventEmitter } from '@/lib/eventBus';
import { getChat, updateChatInfo } from '@/services/chat';
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
            role: 'MEMBER',
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

      const creator = await ctx.prisma.profile.findUnique({
        where: { id: creatorId },
      });

      if (!creator) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Creator profile not found',
        });
      }

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
          content: true,
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
