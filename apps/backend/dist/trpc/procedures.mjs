// src/trpc/init.ts
import { initTRPC } from "@trpc/server";
import { superjson } from "@common";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;

// src/trpc/middleware.ts
import { TRPCError } from "@trpc/server";
var isAuthed = t.middleware(
  ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }
);
var isAdmin = t.middleware(
  ({ ctx, next }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new TRPCError({
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
export {
  adminProcedure,
  publicProcedure,
  userProcedure
};
//# sourceMappingURL=procedures.mjs.map