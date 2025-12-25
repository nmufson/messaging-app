'use client';
import { useChatList } from '@/hooks/chat';
import { ChatPreview } from './ChatPreview';
import { MessageSearchBar } from './SearchBar';
import MainHeader from '@/components/mainHeader/mainHeader';

export default function ChatList() {
  const { chats, isLoading, error } = useChatList();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="bg-blue-500 flex flex-col">
      <MainHeader />
      <MessageSearchBar />
      <div>
        {!chats || chats.length === 0 ? (
          <div>No chats yet</div>
        ) : (
          chats.map((chat) => {
            return <ChatPreview key={chat.id} chat={chat} />;
          })
        )}
      </div>
    </div>
  );
}
