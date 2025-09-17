import { router, userProcedure } from '../trpc';
import { tracked } from '@trpc/server';
import { z } from 'zod';
import EventEmitter, { on } from 'events';
import { observable } from '@trpc/server/observable';
import { MessageType, SendMessageInput } from '@common/schemas/message';
import { TRPCError } from '@trpc/server';
import { findOrCreateDirectConvo } from '../services/conversation';
import { sendMessage } from '../services/message';
import { Message } from '@/packages/db';

const eventEmitter = new EventEmitter();

export const messageRouter = router({
  onNewMessage: userProcedure
    .input(
      z.object({
        conversationId: z.string(),
        lastEventId: z.string().nullish(),
      })
    )
    .subscription(async function* ({ input, ctx, signal }) {
      const { lastEventId, conversationId } = input;
      if (lastEventId) {
      }
      for await (const [data] of on(eventEmitter, 'add', {
        // Passing the AbortSignal from the request automatically cancels the event emitter when the subscription is aborted
        signal,
      })) {
        const message: Message = data;

        yield tracked(message.id, message);
      }
    }),
  sendDirectMessage: userProcedure
    .input(
      z.object({
        sender: z.string(),
        receiver: z.string(),
        type: MessageType,
        content: z.string().nullable(),
        imageUrl: z.string().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { sender, receiver, content, imageUrl, type } = input;

      const convo = await findOrCreateDirectConvo(ctx.prisma, sender, receiver);

      if (!convo) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found or could not be created',
        });
      }

      const newDirectMessage = await sendMessage(ctx.prisma, {
        ...input,
        conversationId: convo.id,
      });

      return { convo, newDirectMessage };
    }),
  sendMessageToConversation: userProcedure
    .input(SendMessageInput)
    .query(async ({ input, ctx }) => {
      const { sender, conversationId, content, imageUrl, type } = input;

      const convo = await ctx.prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          participants: true,
        },
      });

      if (!convo) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Conversation not found',
        });
      }

      if (!convo.participants.some((p) => p.id === sender)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User is not a participant in this conversation',
        });
      }

      const newMessage = await sendMessage(ctx.prisma, input);

      return { newMessage };
    }),
});
