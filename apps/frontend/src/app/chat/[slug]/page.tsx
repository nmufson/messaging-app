'use client';
import { useParams } from 'next/navigation';
import { extractUUIDFromSlug, getChatName } from '@/utils';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { useChat } from '@/hooks/chat';

export default function Chat() {
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

  const { chat, isLoading, error, mutate } = useChat({
    chatId,
    profileId: profile?.id,
  });

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
