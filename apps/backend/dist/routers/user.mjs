// src/routers/user.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z } from "@common";

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

// src/services/user.ts
import { prisma } from "@db";
async function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}
async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

// src/trpc/context.ts
import { prisma as prisma2 } from "@db";

// src/trpc/init.ts
import { initTRPC } from "@trpc/server";
var t = initTRPC.context().create();
var router = t.router;

// src/trpc/middleware.ts
import { TRPCError as TRPCError2 } from "@trpc/server";
var isAuthed = t.middleware(
  ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError2({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }
);
var isAdmin = t.middleware(
  ({ ctx, next }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new TRPCError2({
        code: "UNAUTHORIZED",
        message: "You must be an admin to access this route"
      });
    }
    return next({ ctx });
  }
);

// src/trpc/procedures.ts
var publicProcedure = t.procedure;
var userProcedure = t.procedure.use(isAuthed);
var adminProcedure = t.procedure.use(isAuthed).use(isAdmin);

// src/routers/user.ts
var userRouter = router({
  getUserById: userProcedure.input(z.object({ userId: z.string() })).query(async ({ input, ctx }) => {
    const { userId } = input;
    try {
      const user = getUserById(userId);
      return { user };
    } catch (err) {
      handleTRPCError(err, "Failed to retrieve user");
    }
  }),
  getUserByEmail: userProcedure.input(z.object({ email: z.string().email() })).query(async ({ input, ctx }) => {
    const user = await getUserByEmail(input.email);
    if (!user) {
      throw new TRPCError3({
        code: "NOT_FOUND",
        message: "No user found with this email"
      });
    }
    return user;
  })
});
export {
  userRouter
};
//# sourceMappingURL=user.mjs.map