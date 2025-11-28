'use client';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useTRPC } from '../lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { ObjectId, UserRole } from '@repo/common';
import { usePathname, useRouter } from 'next/navigation';
import * as R from 'remeda';
import { Spinner } from 'react-bootstrap';
import { isAuthed } from '@repo/backend/trpc';

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

const AUTH_PAGES = ['/login', '/signup', '/'];

export function checkIfAuthPage(pathname: string) {
  return R.isIncludedIn(pathname, AUTH_PAGES);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const trpc = useTRPC();
  const router = useRouter();
  const pathname = usePathname();

  const queryOptions = trpc.auth.me.queryOptions();
  const {
    data: authData,
    isLoading,
    error,
  } = useQuery({
    ...queryOptions,
    retry: (failureCount, error) => {
      // Don't retry on UNAUTHORIZED
      if (error?.data?.code === 'UNAUTHORIZED') {
        return false;
      }
      return failureCount < 3;
    },
  });

  const isAuthPage = checkIfAuthPage(pathname);
  const isCreateProfilePage = pathname === '/create-profile';

  useEffect(() => {
    // Unauthorized -> redirect to home (unless already on auth page)
    if (error?.data?.code === 'UNAUTHORIZED' && !isAuthPage) {
      console.log('Navigating unauthorized user to Home page.');
      router.push('/');
      return;
    }

    // Authorized with profile on auth page -> redirect to chats
    if (authData?.profile && (isAuthPage || isCreateProfilePage)) {
      console.log('Navigating authorized user to Chats page.');
      router.push('/chats');
      return;
    }

    // Authorized without profile -> redirect to create-profile (unless already there)
    if (authData && !authData.profile && !isAuthPage && !isCreateProfilePage) {
      console.log('Navigating user without profile to Create Profile page.');
      router.push('/create-profile');
      return;
    }
  }, [error, isAuthPage, isCreateProfilePage, router, authData]);

  let user = null;
  let profile = null;
  if (authData) {
    const { profile: p, ...restOfUser } = authData;
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
