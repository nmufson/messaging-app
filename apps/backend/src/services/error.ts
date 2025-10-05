import { TRPCError } from '@trpc/server';
import { logger } from '../lib/pino';

export function handleTRPCError(
  err: unknown,
  fallbackMessage = 'An error occured',
  context?: Record<string, any> // add other contextual data
): never {
  if (err instanceof TRPCError) {
    throw err;
  }

  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;

  logger.error(
    {
      error: errorMessage,
      stack: errorStack,
      ...context,
    },
    fallbackMessage
  );

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: fallbackMessage,
  });
}
