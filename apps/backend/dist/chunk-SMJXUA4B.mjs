import {
  logger
} from "./chunk-6VGUZGDJ.mjs";

// src/services/error.ts
import { TRPCError } from "@trpc/server";
function handleTRPCError(err, fallbackMessage = "An error occured", context) {
  if (err instanceof TRPCError) {
    throw err;
  }
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : void 0;
  logger.error(
    {
      error: errorMessage,
      stack: errorStack,
      ...context
    },
    fallbackMessage
  );
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: fallbackMessage
  });
}

export {
  handleTRPCError
};
