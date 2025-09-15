import { TRPCError } from '@trpc/server';

export function handleTRPCError(
  err: unknown,
  fallbackMessage = 'An Error occured'
) {
  if (err instanceof TRPCError) {
    throw err;
  }

  console.error(err); // only log if not sending err to client
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: fallbackMessage,
  });
}
