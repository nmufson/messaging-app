'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTRPC } from '../lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { ObjectId, UserRole } from '@repo/common';
import { usePathname, useRouter } from 'next/navigation';

interface User {
  id: ObjectId;
  email: string;
  role: UserRole;
}

interface Profile {
  id: ObjectId;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

const AuthContext = createContext<{
  user: User | null;
  profile: Profile | null;
}>({
  user: null,
  profile: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const trpc = useTRPC();
  const queryOptions = trpc.auth.me.queryOptions();
  const { data, error } = useQuery(queryOptions);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (error?.data?.code === 'UNAUTHORIZED' && !isAuthPage) {
      // TODO: change this to home page?
      router.push('/login');
    }
  }, [error, isAuthPage, router]);

  let user = null;
  let profile = null;
  if (data) {
    const { profile: p, ...restOfUser } = data;
    user = restOfUser;
    profile = p;
  }

  return (
    <AuthContext.Provider value={{ user, profile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
