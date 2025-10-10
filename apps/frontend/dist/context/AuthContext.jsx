'use client';
import { createContext, useContext } from 'react';
import { useTRPC } from '../lib/trpc';
import { useQuery } from '@tanstack/react-query';
const AuthContext = createContext({
    user: null,
});
export const AuthProvider = ({ children }) => {
    const trpc = useTRPC();
    const queryOptions = trpc.auth.me.queryOptions();
    const { data } = useQuery(queryOptions);
    return (<AuthContext.Provider value={{ user: data !== null && data !== void 0 ? data : null }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => useContext(AuthContext);
