'use client';
import { RouterOutputs, useTRPC } from '../../lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { ChatDTO, ChatType } from '@common/schemas/chat';

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
  const { type, name, participants, lastMessage } = chat;
  const isGroupChat = type === ChatType.enum.GROUP;
  const participantNames = participants.map(
    (p) => `${p.firstName} ${p.lastName}`
  );
  const chatDisplayName =
    isGroupChat && name ? name : participantNames.join(', ');

  return (
    <div className="">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Flag_of_Germany_%28RGB%29.svg/330px-Flag_of_Germany_%28RGB%29.svg.png" />
      <h6></h6>
    </div>
  );
}
