'use client';
import { ChatContent } from '@/components/chat/ChatContent';
import { useQueryState } from 'nuqs';
// Removed stray closing brace

export function Chat() {
  const [chatId, setChatId] = useQueryState('profile');
  if (!chatId) {
    return <div>Invalid chat URL</div>;
  }
  return <ChatContent chatId={chatId} />;
}
