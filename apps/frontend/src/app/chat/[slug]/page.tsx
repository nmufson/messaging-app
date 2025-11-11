'use client';
import { ChatContent } from '@/components/chat/ChatContent';
import { useQueryState } from 'nuqs';

export default function Chat() {
  const [chatId] = useQueryState('chat');
  const [messageId] = useQueryState('message');
  if (!chatId) {
    return <div>Invalid chat URL</div>;
  }
  return <ChatContent chatId={chatId} messageToView={messageId} />;
}
