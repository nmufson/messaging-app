import { ObjectId } from '@repo/common';
import { SendMessageInput } from '@repo/common';
import { tracked, TRPCError } from '@trpc/server';
import { MessageDTO, z } from '@repo/common';
import { sendMessage } from '../services/message';
import { router, userProcedure } from '../trpc';
import { on } from 'events';
import { eventEmitter } from '../lib/eventBus';
import { logger } from 'src/lib/pino';

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

      const chat = await ctx.prisma.chat.findUnique({
        where: { id: chatId },
        include: {
          participants: true,
        },
      });

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
});
