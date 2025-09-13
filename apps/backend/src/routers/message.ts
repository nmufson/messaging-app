import { router, publicProcedure } from '../trpc';
import { MessageType, UserRole } from '@db';
import { z } from 'zod';
import { MessageInput } from '@common/schemas/message';
import { DateTime } from 'luxon';

export const messageRouter = router({
  sendMessage: publicProcedure
    .input(MessageInput)
    .query(async ({ input, ctx }) => {
      const { senderId, conversationId, content, imageUrl, messageType } =
        input;

      const initialMessageData = {
        senderId,
        conversationId,
        type: messageType,
      };
      let fullMessageData;
      if (messageType === 'TEXT') {
        fullMessageData = { ...initialMessageData, content };
      } else if (messageType === 'IMAGE') {
        fullMessageData = { ...initialMessageData, imageUrl };
      }

      const newMessage = await ctx.prisma.message.create({
        data: fullMessageData,
      });
    }),
});
