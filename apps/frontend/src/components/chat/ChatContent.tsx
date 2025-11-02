import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useContext, useMemo, useState } from 'react';
import { useRef, useEffect } from 'react';
import { MessageBubble } from '@/app/chat/[slug]/MessageBubble';
import { useChat } from '@/hooks/chat';
import { formatDisplayDate, getChatName } from '@/utils';
import { ChatType, ObjectId } from '@repo/common';
import { BooleanOptional } from 'qs';
import { useRouter } from 'next/navigation';
import { useModalContext } from '@/context/ModalContext';
import { SelectedProfile } from '@/app/chats/SearchModal';

interface ChatContentProps {
  chatId: ObjectId | null;
  profiles?: SelectedProfile[];
  inModalView?: boolean;
}

export function ChatContent(props: ChatContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { closeModal } = useModalContext();
  const { chatId, profiles, inModalView } = props;
  const { profile } = useAuth();
  const [textInput, setTextInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  const profileIds = profiles?.map((profile) => profile.id);
  const { chat, isLoading, error, mutate } = useChat({
    chatId,
    profileIds,
    senderProfileId: profile?.id,
  });

  useEffect(() => {
    // TODO: handle this differently??
    if (!isLoading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesEndRef, isLoading]);

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile || !chat) {
      console.error(
        { profile, chat },
        'Sender profile and chat required to send message'
      );
      return;
    }
    mutate(
      {
        content: textInput || null,
        imageUrl: imageUrlInput || null,
        sender: profile.id,
        chatId: chat.id,
        type: textInput ? 'TEXT' : 'IMAGE',
      },
      {
        onSuccess: () => {
          if (inModalView) {
            router.push(`/chat/chat?chat=${chat.id}`);
          }
        },
      }
    );

    setTextInput('');
    setImageUrlInput('');
    console.log('Message sent successfully!');
  };

  // TODO: find better way to handle this
  const { name, participants, type, messages, creatorId, createdAt } =
    useMemo(() => {
      if (chat) return chat;

      // potential chat to start
      return {
        name: null,
        participants: profiles ?? [],
        type: ChatType.enum.GROUP,
        messages: [],
        creatorId: null,
        createdAt: null,
      };
    }, [chat, profiles]);

  const chatCreator = creatorId
    ? participants.find((participant) => participant.id === creatorId)
    : null;
  const createdAtDisplay = createdAt
    ? formatDisplayDate(createdAt, { withPreposition: true })
    : null;

  const displayName = getChatName({
    name,
    participants,
    profileId: profile?.id,
  });

  return (
    <div className="flex flex-col h-screen">
      <div className="header-container p-4 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
        <Link href="/chats">
          <i className="bi bi-caret-left-fill text-3xl" />
        </Link>
        <h1 className="text-xl font-semibold">{displayName}</h1>
        {/* have this button go to user profile if its direct chat, if group go to group info */}
        <i className="bi bi-info-circle text-2xl" />
      </div>
      <div className="messages-container flex-1 overflow-y-auto px-2 py-4">
        {chatCreator && (
          <small>{`${chatCreator.firstName} ${chatCreator.lastName} created the chat ${createdAtDisplay}`}</small>
        )}
        {messages &&
          messages.length > 0 &&
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={profile?.id === message.senderId}
            />
          ))}
        <div ref={messagesEndRef} />
      </div>
      {/* TODO: extract this to component? */}
      <form
        onSubmit={handleSubmitMessage}
        className="send-message-form flex gap-3 justify-between items-center p-2 flex-shrink-0 bg-white border-t"
      >
        <div>
          <i className="bi bi-image text-3xl" />
        </div>
        <input
          type="text"
          name="message"
          autoComplete="off"
          placeholder="Type a message…"
          className="w-7/10 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 "
          aria-label="Message input"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          required
        />
        <button type="submit" disabled={textInput.trim() === ''}>
          <i className="bi bi-arrow-up" />
        </button>
      </form>
    </div>
  );
}
