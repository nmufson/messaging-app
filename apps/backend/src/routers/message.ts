import { router, publicProcedure, userProcedure } from '../trpc';
import { UserRole } from '@db';
import { z } from 'zod';
import { DateTime } from 'luxon';
import {
  Message,
  MessageType,
  SendMessageInput,
} from '@common/schemas/message';
import { TRPCBuilder, TRPCError } from '@trpc/server';
import { findOrCreateDirectConvo } from '../services/conversation';
import { sendMessage } from '../services/message';

export const messageRouter = router({
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
  sendMessage: userProcedure
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
