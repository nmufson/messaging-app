import { getChat } from '@/services/chat';
import {
  ObjectId,
  PhotoMessageSearchResultDTO,
  SendMessageInput,
  tagActivity,
  TextMessageSearchResultDTO,
  z,
} from '@repo/common';
import { tracked, TRPCError } from '@trpc/server';
import { on } from 'events';
import { logger } from 'src/lib/pino';
import { eventEmitter } from '../lib/eventBus';
import {
  getMatchingPhotoMessages,
  getMatchingTextMessages,
  sendMessage,
} from '../services/message';
import { profileProcedure, router } from '../trpc';
import { MessageActivityDTO } from '@repo/common/schemas/activities';

export const messageRouter = router({
  onNewMessage: profileProcedure
    .input(
      z.object({
        chatId: ObjectId,
        lastMessageId: ObjectId.nullish(),
      })
    )
    .subscription(async function* ({ input, ctx, signal }) {
      const { lastMessageId, chatId } = input;

      if (lastMessageId) {
        const lastMessage = await ctx.prisma.message.findUnique({
          where: { id: lastMessageId },
        });

        if (lastMessage) {
          const missedMessages = await ctx.prisma.message.findMany({
            where: {
              chatId,
              // query all messages created after our lastMessage
              createdAt: { gt: lastMessage.createdAt },
            },
            orderBy: { createdAt: 'asc' },
          });

          for (const msg of missedMessages) {
            yield tracked(msg.id, msg);
          }
        }
      }

      for await (const [message] of on(
        eventEmitter,
        `addMessageToChat:${chatId}`,
        {
          signal,
        }
      )) {
        yield tracked(message.id, message);
      }
    }),
  sendToChat: profileProcedure
    .input(SendMessageInput)
    .output(MessageActivityDTO)
    .mutation(async ({ input, ctx }) => {
      const { sender, chatId } = input;

      const chat = await getChat(ctx.prisma, { chatId });

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'chat not found',
        });
      }

      const senderProfile = chat.participants.find(
        (p) => p.profile.id === sender
      );

      if (!senderProfile) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User is not a participant in this chat',
        });
      }

      const newMessage = await sendMessage(ctx.prisma, input);
      const messageActivity = tagActivity(newMessage, 'message');

      logger.info({ newMessage }, 'emitting message');
      eventEmitter.emit(`addMessageToChat:${chatId}`, newMessage);

      return messageActivity;
    }),
  getTextMessages: profileProcedure
    .input(
      z.object({
        searchInput: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .output(TextMessageSearchResultDTO.array())
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const { searchInput, limit } = input;

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
  getPhotoMessages: profileProcedure
    .input(
      z.object({
        searchInput: z.string().optional(),
        limit: z.number().default(30),
      })
    )
    .output(PhotoMessageSearchResultDTO.array())
    .query(async ({ ctx, input }) => {
      const { searchInput, limit } = input;
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
