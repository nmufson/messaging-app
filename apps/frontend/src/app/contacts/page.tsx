'use client';

import { useOnlinePresence } from '@/hooks/profile';

export default function Contacts() {
  // TODO: add friends list
  const { friendsWithPresence, isLoading: isPresenceLoading } =
    useOnlinePresence();

  return <div></div>;
}
