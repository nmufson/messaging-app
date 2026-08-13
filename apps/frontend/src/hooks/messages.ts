import { useTRPC } from '@/lib/trpc';
import { useQuery } from '@tanstack/react-query';

interface MessagesParams {
  searchInput?: string;
  limit?: number;
}

export function useMessages({ searchInput, limit }: MessagesParams) {
  const trpc = useTRPC();
  console.log(searchInput);
  const {
    data: textMessages,
    isLoading: isTextMessagesLoading,
    error: textMessagesError,
  } = useQuery(
    trpc.message.textMessages.queryOptions({
      searchInput,
      limit,
    })
  );

  const {
    data: photoMessages,
    isLoading: isPhotosLoading,
    error: photosError,
  } = useQuery(
    trpc.message.photoMessages.queryOptions({
      searchInput,
      limit,
    })
  );

  return {
    textMessages,
    isTextMessagesLoading,
    textMessagesError,
    photoMessages,
    isPhotosLoading,
    photosError,
  };
}
