import { getChat } from '@/services/chat';
import {
  ChatType,
  ObjectId,
  PhotoMessageSearchResultDTO,
  SendMessageInput,
  TextMessageSearchResultDTO,
  z,
} from '@repo/common';
import { PrismaClient } from '@repo/db';
import { MessageActivityDTO } from '@repo/common';
import { TRPCError } from '@trpc/server';
import {
  getMatchingPhotoMessages,
  getMatchingTextMessages,
  sendMessage,
} from '../services/message';
import { profileProcedure, router } from '../trpc';
import { eventEmitter } from '@/lib/eventBus';

interface EnsureChatForMessageParams {
  prisma: PrismaClient;
  senderId: ObjectId;
  participantProfileIds: ObjectId[];
}

async function ensureChatForMessage(
  params: EnsureChatForMessageParams
): Promise<ObjectId> {
  const { prisma, senderId, participantProfileIds } = params;

  const normalizedParticipantProfileIds = Array.from(
    new Set([...participantProfileIds, senderId])
  );

  const existingChat = await getChat(prisma, {
    participantProfileIds: normalizedParticipantProfileIds,
  });

  if (existingChat) {
    return existingChat.id;
  }

  const newChatType =
    normalizedParticipantProfileIds.length > 2
      ? ChatType.enum.GROUP
      : ChatType.enum.DIRECT;

  const createdChat = await prisma.$transaction(async (trx) => {
    const chat = await trx.chat.create({
      data: {
        creatorId: senderId,
        type: newChatType,
      },
      select: {
        id: true,
      },
    });

    await trx.chatParticipant.createMany({
      data: normalizedParticipantProfileIds.map((profileId) => ({
        chatId: chat.id,
        profileId,
      })),
    });

    // TODO: maybe only want this for group chats?
    await trx.chatAction.create({
      data: {
        chatId: chat.id,
        actionType: 'CHAT_CREATED',
        actorId: senderId,
      },
    });

    return chat;
  });

  normalizedParticipantProfileIds.forEach((profileId) => {
    if (profileId === senderId) {
      return;
    }

    eventEmitter.emit(`chat:created:${profileId}`, {
      id: createdChat.id,
    });
  });

  return createdChat.id;
}

export const messageRouter = router({
  sendToChat: profileProcedure
    .input(z.object({ message: SendMessageInput, chatId: ObjectId }))
    .output(MessageActivityDTO)
    .mutation(async ({ input, ctx }) => {
      const { senderId } = input.message;

      const chat = await getChat(ctx.prisma, { chatId: input.chatId });

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'chat not found',
        });
      }

      const senderProfile = chat.participants.find(
        (p) => p.profile.id === senderId
      );

      if (!senderProfile) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User is not a participant in this chat',
        });
      }

      const newMessageActivity = await sendMessage(ctx.prisma, input);

      return newMessageActivity;
    }),
  sendToNewChat: profileProcedure
    .input(
      z.object({
        message: SendMessageInput,
        participantProfileIds: ObjectId.array().min(1),
      })
    )
    .output(MessageActivityDTO)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { senderId } = input.message;

      if (user.profile.id !== senderId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only send messages as yourself.',
        });
      }

      const chatId = await ensureChatForMessage({
        prisma: ctx.prisma,
        senderId,
        participantProfileIds: input.participantProfileIds,
      });

      const messageActivity = await sendMessage(ctx.prisma, {
        message: input.message,
        chatId,
      });

      return messageActivity;
    }),
  textMessages: profileProcedure
    .input(
      z.object({
        searchInput: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .output(TextMessageSearchResultDTO.array())
    .query(async ({ ctx, input }) => {
      const { user } = ctx;

      const userProfileId = user?.profile?.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const messages = await getMatchingTextMessages(ctx.prisma, {
        profileId: userProfileId,
        ...input,
      });

      return messages;
    }),
  photoMessages: profileProcedure
    .input(
      z.object({
        searchInput: z.string().optional(),
        limit: z.number().default(30),
      })
    )
    .output(PhotoMessageSearchResultDTO.array())
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const userProfileId = user?.profile?.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const photoMessages = await getMatchingPhotoMessages(ctx.prisma, {
        profileId: userProfileId,
        ...input,
      });

      return photoMessages;
    }),
});
