'use client';
import { useState } from 'react';
import { useTRPC } from '../../lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { ChatDTO } from '@common/schemas/chat';

export default function Chats() {
  const trpc = useTRPC();
  const queryOptions = trpc.chat.getAll.queryOptions({});

  const { data, isLoading, error } = useQuery(queryOptions);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const chats: ChatDTO[] = data.chats;

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

function ChatPreview({ chat }: { chat: ChatDTO }) {
  return (
    <div className="">
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Flag_of_Germany_%28RGB%29.svg/330px-Flag_of_Germany_%28RGB%29.svg.png" />
    </div>
  );
}
