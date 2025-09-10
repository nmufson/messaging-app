import { contextProps } from '@trpc/react-query/shared';
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const messageRouter = router({
  sendMessage: publicProcedure
    .input(z.object({
      // extract this to schema file 
      senderId: z.string(),
      conversationId: z.string(),
      content: z.string() // allow this to also be image??
      messageType: MessageType,
    }))
    .query(async ({ input, ctx })) => {
      const { senderId, conversationId, content, imageUrl, messageType } = input;

      let messageData = {
        senderId,
        conversationId,
        type: messageType,
      };

      if (messageType === 'TEXT') {
        messageData.content = content;
      } else if (messageType === 'IMAGE') {
        messageData.imageUrl = imageUrl;
      }

      const newMessage = await ctx.prisma.message.create({
        data: messageData,
      })
    }
})