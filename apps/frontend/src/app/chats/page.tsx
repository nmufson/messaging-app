'use client';
import { useChatList } from '@/hooks/chat';
import { ChatPreview } from './ChatPreview';

export default function Chats() {
  const { chats, isLoading, error } = useChatList();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!chats || chats.length === 0) return <div>No messages found</div>;

  return (
    <div className="bg-blue-500 flex">
      <div>
        {chats &&
          chats.map((chat) => {
            return <ChatPreview key={chat.id} chat={chat} />;
          })}
      </div>
    </div>
  );
}
