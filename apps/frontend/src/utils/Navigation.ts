import { ObjectId } from '@repo/common';
import { useRouter } from 'next/navigation';

export function useNavigation() {
  const router = useRouter();

  const navigateToChat = (chatId: ObjectId) => {
    router.push(`/chat/chat?chat=${chatId}`);
  };

  const navigateToMessage = (chatId: ObjectId, messageId: ObjectId) => {
    router.push(`/chat/chat?chat=${chatId}&message=${messageId}`);
  };

  return {
    navigateToChat,
    navigateToMessage,
  };
}
