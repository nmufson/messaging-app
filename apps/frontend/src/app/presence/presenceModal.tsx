import { useModalContext } from '@/context/ModalContext';
import { useOnlinePresence } from '@/hooks/profile';
import { useTRPC } from '@/lib/trpc';
import { DurationObject, ObjectId } from '@repo/common';
import { useQuery } from '@tanstack/react-query';

export function PresenceModal() {
  const { closeModal } = useModalContext();
}
