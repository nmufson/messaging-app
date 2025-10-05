import {
  t
} from "./chunk-XI2LZ4T3.mjs";

// src/trpc/middleware.ts
import { TRPCError } from "@trpc/server";
var isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
var isAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.user?.role !== "ADMIN") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be an admin to access this route"
    });
  }
  return next({ ctx });
});

export {
  isAuthed,
  isAdmin
};
