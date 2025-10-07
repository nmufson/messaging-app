'use client';
import { useParams } from 'next/navigation';
import { useTRPC } from '../../../lib/trpc';
import { skipToken, useQuery } from '@tanstack/react-query';
import { skip } from 'node:test';

export default function Chat() {
  const trpc = useTRPC();
  const params = useParams();
  const slug = params.slug as string;

  // Extract chatId from the slug (everything after the last dash)
  const chatId = slug.split('-').pop();

  console.log('Full slug:', slug);
  console.log('Extracted chatId:', chatId);

  if (!chatId) {
    return <div>Invalid chat URL</div>;
  }

  const { data, isLoading, error } = useQuery(
    trpc.chat.byId.queryOptions(chatId ? { chatId } : skipToken)
  );

  console.log(chatId, typeof chatId);
  return (
    <div>
      <h1>Chat: {chatId}</h1>
    </div>
  );
}
