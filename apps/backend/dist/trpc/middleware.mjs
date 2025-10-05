// src/trpc/middleware.ts
import { TRPCError } from "@trpc/server";

// src/trpc/init.ts
import { initTRPC } from "@trpc/server";
var t = initTRPC.context().create();
var router = t.router;

// src/trpc/middleware.ts
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
export {
  isAdmin,
  isAuthed
};
//# sourceMappingURL=middleware.mjs.map