// src/services/error.ts
import { TRPCError } from "@trpc/server";

// src/lib/pino.ts
import pino from "pino";
var isDev = process.env.NODE_ENV === "development";
var logger = pino({
  level: isDev ? "debug" : "info",
  ...isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname"
      }
    }
  },
  ...process.env.NODE_ENV === "production" && {
    formatters: {
      level: (label) => ({ level: label })
    }
  }
});

// src/services/error.ts
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
//# sourceMappingURL=error.mjs.map