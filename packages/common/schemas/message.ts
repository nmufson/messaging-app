import { z } from 'zod';
import { MessageType } from '@/packages/db';

export const MessageInput = z.object({
  senderId: z.string(),
  conversationId: z.string(),
  content: z.string(),
  imageUrl: z.string(),
  messageType: MessageType,
});
export type MessageInput = z.infer<typeof MessageInput>;
