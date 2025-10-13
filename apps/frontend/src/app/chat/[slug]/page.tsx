'use client';
import { useParams } from 'next/navigation';
import { useTRPC } from '@/lib/trpc';
import { skipToken, useMutation, useQuery } from '@tanstack/react-query';
import { extractUUIDFromSlug, formatMessageTime, getChatName } from '@/utils';
import { useAuth } from '@/context/AuthContext';
import { MessageDTO } from '@repo/common';
import Link from 'next/link';
import { useState } from 'react';
import { handleClientScriptLoad } from 'next/script';
import { subscribe } from 'diagnostics_channel';

export default function Chat() {
  const trpc = useTRPC();
  const { profile } = useAuth();
  const params = useParams();
  const slug = params.slug as string;
  // ! consolidate these??
  const [textInput, setTextInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  const chatId = extractUUIDFromSlug(slug);

  if (!chatId) {
    return <div>Invalid chat URL</div>;
  }

  const {
    data: chat,
    isLoading,
    error,
  } = useQuery(trpc.chat.byId.queryOptions(chatId ? { chatId } : skipToken));

  const {
    mutate,
    isPending,
    error: sendToChatError,
  } = useMutation(
    trpc.message.sendToChat.mutationOptions({
      onSuccess: () => {
        // ! add query data setting
        console.log('Message sent!');
      },
    })
  );

  const handleSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profile) {
      console.error('Profile required to send message');
      return;
    }

    mutate({
      content: textInput || null,
      imageUrl: imageUrlInput || null,
      sender: profile.id,
      chatId,
      type: textInput ? 'TEXT' : 'IMAGE',
    });
    console.log('Message sent successfully!');
  };

  if (isLoading) {
    return <div>Loading chat...</div>;
  }

  if (error) {
    return <div>Error loading chat: {error.message}</div>;
  }

  if (!chat) {
    return <div>Chat not found</div>;
  }

  const { name, participants, type, messages } = chat;

  const displayName = getChatName({
    type,
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
        {messages &&
          messages.length > 0 &&
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={profile?.id === message.senderId}
            />
          ))}
      </div>

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

interface MessageBubbleProps {
  message: MessageDTO;
  isCurrentUser: boolean;
}

export function MessageBubble(props: MessageBubbleProps) {
  const { message, isCurrentUser } = props;
  const { senderId, content, imageUrl, createdAt } = message;
  const displayTime = formatMessageTime(createdAt);

  return (
    <div
      className={`flex w-full mt-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-75/100 rounded-xl px-4 py-2 shadow-md break-words '
            ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}
      >
        <div>
          {content ? (
            <p>{content}</p>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              className="max-w-[200px] max-h-[200px] rounded-lg"
            />
          ) : null}
        </div>
        <div>
          <small>{displayTime}</small>
        </div>
      </div>
    </div>
  );
}
