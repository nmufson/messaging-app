import { CHAT_INFO_SELECT } from '@/services/chat';
import { createAction } from '@/services/action';
import { router } from '@/trpc';
import {
  ActionOutputDTO,
  CHAT_UPDATE_ACTIONS,
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
});
