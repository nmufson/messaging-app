'use client';
import { useChatList } from '@/hooks/chat';
import { ChatPreview } from './ChatPreview';
import { MessageSearchBar } from './SearchBar';
import { useOnlinePresence } from '@/hooks/profile';
import { useRouter } from 'next/navigation';

export default function Chats() {
  const { chats, isLoading, error } = useChatList();
  const { friendsWithPresence, isLoading: isPresenceLoading } =
    useOnlinePresence();

  const numFriendsOnline =
    friendsWithPresence?.filter((friend) => friend.isOnline)?.length ?? 0;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!chats || chats.length === 0) return <div>No messages found</div>;

  return (
    <div className="bg-blue-500 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">Chats</h1>
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            onClick={() => {
              // TODO: Navigate to contacts page
              console.log('Navigate to contacts');
            }}
          >
            <i className="bi bi-person-fill text-lg"></i>
            <span className="text-sm font-medium">
              {numFriendsOnline} online
            </span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            onClick={() => {
              // TODO: Navigate to find friends page
              console.log('Navigate to find friends');
            }}
          >
            <i className="bi bi-people text-lg"></i>
            <span className="text-sm font-medium">Find Friends</span>
          </button>
        </div>
      </div>
      <MessageSearchBar />
      <div>
        {chats &&
          chats.map((chat) => {
            return <ChatPreview key={chat.id} chat={chat} />;
          })}
      </div>
    </div>
  );
}
