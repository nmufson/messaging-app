'use client';
import { ChatContent } from '@/components/chat/ChatContent';
import { useQueryState } from 'nuqs';

export default function Chat() {
  const [chatId, setChatId] = useQueryState('chat');
  if (!chatId) {
    return <div>Invalid chat URL</div>;
  }
  return <ChatContent chatId={chatId} />;
}
