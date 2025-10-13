import { ChatDTO } from '@repo/common';
import * as R from 'remeda';
import Link from 'next/link';
import { formatMessageTime, getChatName, slugify } from '@/utils/formatting';
import { useAuth } from '../../context/AuthContext';

interface ChatPreviewProps {
  chat: ChatDTO;
}

export function ChatPreview({ chat }: ChatPreviewProps) {
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
  const { profile } = useAuth();
  const lastMessage = messages.length ? messages[0] : null;
  const displayName = getChatName({
    type,
    name,
    participants,
    profileId: profile?.id,
  });

  // TODO: make this show multiple user pics similar to Messages
  const lastSender = participants.find((p) => p.id === lastMessage?.senderId);
  const creator = participants.find((p) => p.id === creatorId);

  const displayPicture =
    groupPictureUrl ||
    lastSender?.profilePictureUrl ||
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Flag_of_Germany_%28RGB%29.svg/330px-Flag_of_Germany_%28RGB%29.svg.png';

  const displayMessage = lastMessage
    ? lastMessage.content ||
      `${lastSender?.firstName} ${lastSender?.lastName} sent a photo`
    : `Chat created by ${creator?.firstName} ${creator?.lastName}`;

  const timeToShow = lastMessage ? lastMessage.createdAt : chatCreatedAt;
  const displayTime = formatMessageTime(timeToShow);

  const formattedDisplayName = R.truncate(displayName, 20);
  const formattedDisplayMessage = R.truncate(displayMessage, 40);

  const chatLink = `/chat/${slugify(displayName)}-${chatId}`;

  return (
    <Link href={chatLink}>
      <div className="chat-preview-container flex items-center cursor-pointer">
        <div className="rounded-full w-10  overflow-hidden flex items-center justify-center bg-gray-200 mr-3">
          <img alt="Chat" className="w-10 object-cover" src={displayPicture} />
        </div>
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
