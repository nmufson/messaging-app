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
    <div className="min-h-screen bg-blue-500 flex justify-center">
      <div className="w-full max-w-2xl min-h-screen flex flex-col">
        <MainHeader />
        <div className="px-4 pb-3">
          <MessageSearchBar />
        </div>

        <main className="flex-1 bg-white">
          {!chats || chats.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div>No chats yet</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {chats.map((chat) => (
                <ChatPreview key={chat.id} chat={chat} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
