'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTRPC } from '../lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { ObjectId, UserRole } from '@repo/common';

interface User {
  id: ObjectId;
  email: string;
  role: UserRole;
}

interface Profile {
  id: ObjectId;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
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
  const { data } = useQuery(queryOptions);

  if (!data) return null;

  const { profile, ...restOfUser } = data;

  return (
    <AuthContext.Provider
      value={{ user: restOfUser ?? null, profile: profile ?? null }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
