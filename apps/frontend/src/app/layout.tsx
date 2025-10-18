'use client';
import './globals.css';
import {
  createTRPCClient,
  createWSClient,
  httpBatchLink,
  splitLink,
  wsLink,
} from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AppRouter, TRPCProvider } from '../lib/trpc';
import { superjson } from '@repo/common';
import { AuthProvider } from '../context/AuthContext';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

const wsClient = createWSClient({
  url: 'ws://localhost:3001/trpc',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition(op) {
            return op.type === 'subscription';
          },
          true: wsLink({ client: wsClient, transformer: superjson }),
          false: httpBatchLink({
            transformer: superjson,
            url: 'http://localhost:3001/trpc',
            fetch(url, options) {
              return fetch(url, {
                ...options,
                credentials: 'include',
              });
            },
          }),
        }),
      ],
    })
  );

  return (
    <html lang="en">
      <body className="overflow-hidden h-screen w-screen">
        <QueryClientProvider client={queryClient}>
          <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
            <AuthProvider>{children}</AuthProvider>
          </TRPCProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
