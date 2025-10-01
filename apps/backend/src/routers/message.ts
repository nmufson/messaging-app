import { ObjectId } from '@common/schemas/primitives';
import { MessageType, SendMessageInput } from '@common/schemas/message';
import { tracked, TRPCError } from '@trpc/server';
import { z } from '@common';
import { findOrCreateDirectChat } from '../services/chat';
import { sendMessage } from '../services/message';
import { router, userProcedure } from '../trpc';
import { on } from 'events';
import { eventEmitter } from '../lib/eventBus';

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
  sendDirect: userProcedure
    .input(
      z.object({
        sender: ObjectId,
        receiver: ObjectId,
        type: MessageType,
        content: z.string().nullable(),
        imageUrl: z.string().nullable(),
      })
    )
    // TODO: add an event emitter here for add chat
    .mutation(async ({ input, ctx }) => {
      const { sender, receiver, content, imageUrl, type } = input;

      const { chat, isNewChat } = await findOrCreateDirectChat(
        ctx.prisma,
        sender,
        receiver
      );

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'chat not found or could not be created',
        });
      }

      const newDirectMessage = await sendMessage(ctx.prisma, {
        ...input,
        chatId: chat.id,
      });

      if (isNewChat) {
        eventEmitter.emit(`newChat:${sender}`, chat);
        eventEmitter.emit(`newChat:${receiver}`, chat);
      }

      return { chat, newDirectMessage };
    }),
  sendTochat: userProcedure
    .input(SendMessageInput)
    .query(async ({ input, ctx }) => {
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

      eventEmitter.emit(`addMessageToChat:${chatId}`, newMessage);

      return { newMessage };
    }),
});
