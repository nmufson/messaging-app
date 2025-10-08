'use client';
import { useParams } from 'next/navigation';
import { useTRPC } from '../../../lib/trpc';
import { skipToken, useQuery } from '@tanstack/react-query';
import { extractUUIDFromSlug, getChatName } from '../../../utils';
import { useAuth } from '../../../context/AuthContext';

export default function Chat() {
  const trpc = useTRPC();
  const { user } = useAuth();
  const params = useParams();
  const slug = params.slug as string;
  console.log(user);
  const chatId = extractUUIDFromSlug(slug);

  if (!chatId) {
    return <div>Invalid chat URL</div>;
  }

  const {
    data: chat,
    isLoading,
    error,
  } = useQuery(trpc.chat.byId.queryOptions(chatId ? { chatId } : skipToken));

  if (isLoading) {
    return <div>Loading chat...</div>;
  }

  if (error) {
    return <div>Error loading chat: {error.message}</div>;
  }

  if (!chat) {
    return <div>Chat not found</div>;
  }

  const { name, participants, type } = chat;

  const displayName = getChatName({ type, name, participants });
  console.log(chatId, typeof chatId);
  return (
    <div>
      <div className="header-container p-4 border-b bg-gray-50">
        <h1 className="text-xl font-semibold">Chat: {displayName}</h1>
        <p className="text-sm text-gray-600">ID: {chatId}</p>
      </div>
      <div className="messages-container"></div>
    </div>
  );
}

export function MessageBubble() {}
