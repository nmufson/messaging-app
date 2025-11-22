'use client';
import { useChatList } from '@/hooks/chat';
import { ChatPreview } from './ChatPreview';
import { MessageSearchBar } from './SearchBar';
import { useOnlinePresence } from '@/hooks/profile';
import { useRouter } from 'next/navigation';
import MainHeader from '@/components/mainHeader/mainHeader';

export default function Chats() {
  const { chats, isLoading, error } = useChatList();
  const { activeFriends: friendsWithPresence, isLoading: isPresenceLoading } =
    useOnlinePresence();

  const numFriendsOnline =
    friendsWithPresence?.filter((friend) => friend.isOnline)?.length ?? 0;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!chats || chats.length === 0) return <div>No messages found</div>;

  return (
    <div className="bg-blue-500 flex flex-col">
      <MainHeader numFriendsOnline={numFriendsOnline} />
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
