import { getChat } from '@/services/chat';
import {
  ListPhotoMessageDTO,
  MessageDTO,
  MessageSearchResultDTO,
  ObjectId,
  SendMessageInput,
  z,
} from '@repo/common';
import { tracked, TRPCError } from '@trpc/server';
import { on } from 'events';
import { logger } from 'src/lib/pino';
import { eventEmitter } from '../lib/eventBus';
import {
  getMatchingTextMessages,
  getPhotoMessages,
  sendMessage,
} from '../services/message';
import { router, userProcedure } from '../trpc';

export const messageRouter = router({
  onNewMessage: userProcedure
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
  sendToChat: userProcedure
    .input(SendMessageInput)
    .output(MessageDTO)
    .mutation(async ({ input, ctx }) => {
      const { sender, chatId, content, imageUrl, type } = input;

      const chat = await getChat(ctx.prisma, { chatId });

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'chat not found',
        });
      }

      if (!chat.participants.some((p) => p.id === sender)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User is not a participant in this chat',
        });
      }

      const newMessage = await sendMessage(ctx.prisma, input);

      logger.info({ newMessage }, 'emitting message');
      eventEmitter.emit(`addMessageToChat:${chatId}`, newMessage);

      return newMessage;
    }),
  getTextMessages: userProcedure
    .input(
      z.object({
        searchInput: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .output(MessageSearchResultDTO.array())
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const { searchInput, limit } = input;

      const userProfileId = user?.profile?.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const messages = await getMatchingTextMessages(ctx.prisma, {
        profileId: userProfileId,
        searchInput,
        limit,
      });

      return messages;
    }),
  getPhotoMessages: userProcedure
    .input(z.object({ limit: z.number().default(30) }))
    .output(ListPhotoMessageDTO.array())
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const userProfileId = user?.profile?.id;

      if (!userProfileId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const photoMessages = await getPhotoMessages(ctx.prisma, {
        profileId: userProfileId,
        limit: input.limit,
      });

      return photoMessages;
    }),
});
