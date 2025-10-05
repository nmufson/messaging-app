// src/trpc/context.ts
import { prisma } from "@db";
function createContext({
  req,
  res
}) {
  return { req, res, user: req.user, prisma };
}
function createWSSContext({
  req
}) {
  return {
    req,
    user: void 0,
    // TODO: implement ws auth logic?
    prisma
  };
}

// src/trpc/init.ts
import { initTRPC } from "@trpc/server";
var t = initTRPC.context().create();
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
  createContext,
  createWSSContext,
  isAdmin,
  isAuthed,
  publicProcedure,
  router,
  t,
  userProcedure
};
//# sourceMappingURL=index.mjs.map