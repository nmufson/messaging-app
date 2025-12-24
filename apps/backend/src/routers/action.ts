import { createAction, updateChatInfo } from '@/services/chat';
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
import { eventEmitter } from '@/lib/eventBus';

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

      const { newActionActivity, activityProfiles } = await createAction(
        ctx.prisma,
        actionData
      );

      logger.info({ newActionActivity }, 'Emitting action activity');
      eventEmitter.emit(`addActionToChat:${id}`, newActionActivity);

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

      logger.info({ newActionActivity }, 'Emitting action activity');
      eventEmitter.emit(`addActionToChat:${chatId}`, newActionActivity);

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

      logger.info({ newActionActivity }, 'Emitting action activity');
      eventEmitter.emit(`addActionToChat:${chatId}`, newActionActivity);

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

      logger.info({ newActionActivity }, 'Emitting action activity');
      eventEmitter.emit(`addActionToChat:${chatId}`, newActionActivity);

      logger.info({ newActionActivity, updatedChat }, 'Member left chat');

      return {
        updatedChat,
        newActionActivity,
        activityProfiles,
      };
    }),
});
