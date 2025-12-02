'use client';
import { useChatList } from '@/hooks/chat';
import { ChatPreview } from './ChatPreview';
import { MessageSearchBar } from './SearchBar';

import { useRouter } from 'next/navigation';
import MainHeader from '@/components/mainHeader/mainHeader';
import { useContext, useState } from 'react';
import { ToastContainer } from 'react-bootstrap';
import { useToast } from '@/context/ToastContext';
import { useOnlinePresence } from '@/hooks/onlinePresence';
import { Nanum_Pen_Script } from 'next/font/google';

export default function Chats() {
  const { chats, isLoading, error } = useChatList();
  const { addToast } = useToast();

  const { numProfilesOnline: numFriendsOnline, isLoading: isPresenceLoading } =
    useOnlinePresence();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="bg-blue-500 flex flex-col">
      <MainHeader numFriendsOnline={numFriendsOnline} />
      <MessageSearchBar />
      <div>
        {!chats || chats.length === 0 ? (
          <div>No messages found</div>
        ) : (
          chats.map((chat) => {
            return <ChatPreview key={chat.id} chat={chat} />;
          })
        )}
      </div>
    </div>
  );
}
