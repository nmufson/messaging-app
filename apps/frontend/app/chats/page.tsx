'use client';
import { RouterOutputs, useTRPC } from '../../lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { ChatDTO, ChatType } from '@common/src/schemas/chat';
import { last } from 'remeda';
import { DateTime } from 'luxon';
import * as R from 'remeda';
import Link from 'next/link';

type Chats = RouterOutputs['chat']['getAll'];
type Chat = RouterOutputs['chat']['byId'];

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
    creator,
    participants,
    messages,
    groupPictureUrl,
    createdAt: chatCreatedAt,
  } = chat;
  const lastMessage = messages.length ? messages[0] : null;
  const isGroupChat = type === ChatType.enum.GROUP;
  const participantNames = participants.map(
    (p) => `${p.firstName} ${p.lastName}`
  );
  const displayName = isGroupChat && name ? name : participantNames.join(', ');

  // TODO: make this show multiple user pics similar to Messages
  const displayPicture =
    groupPictureUrl ||
    lastMessage?.sender.profilePictureUrl ||
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

export function formatMessageTime(dt: DateTime) {
  const now = DateTime.now();
  const diffInDays = now.startOf('day').diff(dt.startOf('day'), 'days').days;

  if (dt.hasSame(now, 'day')) {
    return dt.toFormat('h:mm a');
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return dt.toFormat('cccc'); //  "Monday"
  } else {
    // Older than a week
    return dt.toFormat('MM/dd/yyyy');
  }
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
