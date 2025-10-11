'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTRPC } from '../lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@common/src/schemas/primitives';

type User = {
  id: string;
  role: UserRole;
} | null;

const AuthContext = createContext<{ user: User }>({
  user: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const trpc = useTRPC();
  const queryOptions = trpc.auth.me.queryOptions();
  const { data } = useQuery(queryOptions);

  return (
    <AuthContext.Provider value={{ user: data ?? null }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
