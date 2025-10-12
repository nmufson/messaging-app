'use client';
import { useTRPC } from '../../lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { ChatDTO, ChatType } from '@repo/common';
import * as R from 'remeda';
import Link from 'next/link';
import {
  formatMessageTime,
  getChatName,
  slugify,
} from '../../utils/formatting';
import { useAuth } from '../../context/AuthContext';
import { RouterOutputs } from '@repo/trpc';

export default function Chats() {
  const trpc = useTRPC();
  const queryOptions = trpc.chat.getAll.queryOptions({});

  const { data: chats, isLoading, error } = useQuery(queryOptions);

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

interface ChatPreviewProps {
  chat: ChatDTO;
}

function ChatPreview({ chat }: ChatPreviewProps) {
  const {
    id: chatId,
    type,
    name,
    creatorId,
    participants,
    messages,
    groupPictureUrl,
    createdAt: chatCreatedAt,
  } = chat;
  const { user } = useAuth();
  const lastMessage = messages.length ? messages[0] : null;
  const displayName = getChatName({
    type,
    name,
    participants,
    userId: user?.id,
  });

  // TODO: make this show multiple user pics similar to Messages
  const lastSender = participants.find((p) => p.id === lastMessage?.senderId);
  const creator = participants.find((p) => p.id === creatorId);

  const displayPicture =
    groupPictureUrl ||
    lastSender?.profilePictureUrl ||
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Flag_of_Germany_%28RGB%29.svg/330px-Flag_of_Germany_%28RGB%29.svg.png';

  const displayMessage = lastMessage
    ? lastMessage.content
    : `Chat created by ${creator?.firstName} ${creator?.lastName}`;

  const timeToShow = lastMessage ? lastMessage.createdAt : chatCreatedAt;
  const displayTime = formatMessageTime(timeToShow);

  const formattedDisplayName = R.truncate(displayName, 20);
  const formattedDisplayMessage = R.truncate(displayMessage, 40);

  const chatLink = `/chat/${slugify(displayName)}-${chatId}`;

  return (
    <Link href={chatLink}>
      <div className="chat-preview-container flex items-center cursor-pointer">
        <img
          alt="Chat"
          className="w-12 h-12 rounded-full object-cover mr-3"
          src={displayPicture}
        />
        <div className="flex flex-col w-full">
          <div className="flex justify-between">
            <h6>{formattedDisplayName}</h6>
            <small>{displayTime}</small>
          </div>
          <div>
            <small>{formattedDisplayMessage}</small>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MessageSearchBar() {
  return (
    <div>
      <input></input>
    </div>
  );
}
