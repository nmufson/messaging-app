import { useTRPC } from '@/lib/trpc';
import { useQuery } from '@tanstack/react-query';

export function useChatList() {
  const trpc = useTRPC();

  const {
    data: chats,
    isLoading,
    error,
  } = useQuery(trpc.chat.getList.queryOptions({}));

  return { chats, isLoading, error };
}
