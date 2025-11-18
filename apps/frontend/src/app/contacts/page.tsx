'use client';

import { useAuth } from '@/context/AuthContext';
import { useFriends, useOnlinePresence } from '@/hooks/profile';

export default function Contacts() {
  const { profile } = useAuth();

  const { friendsWithPresence, isLoading: isPresenceLoading } =
    useOnlinePresence();

  const { friends, isLoading, error } = useFriends(profile?.id ?? null);

  return <div></div>;
}
