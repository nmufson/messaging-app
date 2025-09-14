import { router, publicProcedure, userProcedure } from '../trpc';
import { MessageType, UserRole } from '@db';
import { z } from 'zod';
import { DateTime } from 'luxon';
import { Message } from '@/packages/common/schemas/message';
import { TRPCBuilder, TRPCError } from '@trpc/server';

export const messageRouter = router({
  sendMessage: userProcedure.input(Message).query(async ({ input, ctx }) => {
    const { senderId, conversationId, content, imageUrl, type } = input;

    const initialMessageData = {
      senderId,
      conversationId,
      type: type,
    };
    let fullMessageData;
    if (type === 'TEXT') {
      fullMessageData = { ...initialMessageData, content };
    } else if (type === 'IMAGE') {
      fullMessageData = { ...initialMessageData, imageUrl };
    }

    if (!fullMessageData) {
      // TODO: improve this
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }

    const newMessage = await ctx.prisma.message.create({
      data: fullMessageData,
    });
  }),
});
