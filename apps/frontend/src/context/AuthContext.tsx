'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTRPC } from '../lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@common/src/schemas/user';
import { ObjectId } from '@repo/common';

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
  const user = data?.user;
  const profile = data?.profile;

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, profile: profile ?? null }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
