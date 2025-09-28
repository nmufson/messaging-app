import { createTRPCClient, httpBatchLink } from '@trpc/react-query';
import type { AppRouter } from '@/apps/backend/src/trpc/router';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000',
    }),
  ],
});
