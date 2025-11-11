import { MessageBubble } from '@/app/chat/[slug]/MessageBubble';
import { SelectedProfile } from '@/app/chats/WriteToChatModal';
import { useAuth } from '@/context/AuthContext';
import { useModalContext } from '@/context/ModalContext';
import { useChat } from '@/hooks/chat';
import { formatDisplayDate, getChatDisplayName } from '@/utils';
import { ChatType, ObjectId } from '@repo/common';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

interface ChatContentProps {
  chatId: ObjectId | null;
  profiles?: SelectedProfile[];
  inModalView?: boolean;
}

export function ChatContent(props: ChatContentProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { chatId, profiles, inModalView } = props;
  const { profile } = useAuth();
  const [textInput, setTextInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  const profileIds = profiles?.map((profile) => profile.id);
  const { chat, isLoading, error, sendMessageToChat, createChat, sendMessage } =
    useChat({
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

  const handleSubmitMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile) {
      console.error('Profile required to send message');
      return;
    }
    sendMessage({
      senderId: profile.id,
      type: textInput ? 'TEXT' : 'IMAGE',
      content: textInput || null,
      imageUrl: imageUrlInput || null,
      onSuccess: (chatId) => {
        if (inModalView) {
          router.push(`/chat/chat?chat=${chatId}`);
        }
      },
    });

    setTextInput('');
    setImageUrlInput('');
    console.log('Message sent successfully!');
  };

  const participants = chat?.participants || [];

  // TODO: find better way to handle this
  const { name, messages, creatorId, createdAt } = useMemo(() => {
    if (chat) return chat;

    // potential chat to start
    return {
      name: null,
      type: ChatType.enum.GROUP,
      messages: [],
      creatorId: null,
      createdAt: null,
    };
  }, [chat]);

  const chatCreator = creatorId
    ? participants.find((participant) => participant.id === creatorId)
    : null;
  const createdAtDisplay = createdAt
    ? formatDisplayDate(createdAt, { withPreposition: true })
    : null;

  const displayName = getChatDisplayName({
    name,
    participants: participants || profiles,
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
      <div className="messages-container flex-1 overflow-y-auto py-4">
        {chatCreator && (
          <small>{`${chatCreator.firstName} ${chatCreator.lastName} created the chat ${createdAtDisplay}`}</small>
        )}
        {messages &&
          messages.length > 0 &&
          messages.map((message, i) => {
            const sender = participants.find((p) => p.id === message.senderId);

            if (!sender) {
              console.error('Sender not found in chat participants', {
                chat,
                senderId: message.senderId,
              });
            }
            const messageWithSender = {
              ...message,
              sender: sender || {
                id: '',
                firstName: 'Unknown',
                lastName: '',
                avatarUrl: null,
              },
            };

            const shouldShowName =
              messages[i - 1]?.senderId != message.senderId;
            const shouldShowAvatar =
              messages[i + 1]?.senderId != message.senderId;
            return (
              <MessageBubble
                key={message.id}
                message={messageWithSender}
                showName={shouldShowName}
                showAvatar={shouldShowAvatar}
              />
            );
          })}
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
