import { getChat } from '@/services/chat';
import {
  PhotoMessageSearchResultDTO,
  SendMessageInput,
  TextMessageSearchResultDTO,
  z,
} from '@repo/common';
import { MessageActivityDTO } from '@repo/common/schemas/activities';
import { TRPCError } from '@trpc/server';
import {
  getMatchingPhotoMessages,
  getMatchingTextMessages,
  sendMessage,
} from '../services/message';
import { profileProcedure, router } from '../trpc';

export const messageRouter = router({
  sendToChat: profileProcedure
    .input(SendMessageInput)
    .output(MessageActivityDTO)
    .mutation(async ({ input, ctx }) => {
      const { senderId, chatId } = input;

      const chat = await getChat(ctx.prisma, { chatId });

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
