"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/trpc/index.ts
var trpc_exports = {};
__export(trpc_exports, {
  adminProcedure: () => adminProcedure,
  createContext: () => createContext,
  createWSSContext: () => createWSSContext,
  isAdmin: () => isAdmin,
  isAuthed: () => isAuthed,
  publicProcedure: () => publicProcedure,
  router: () => router,
  t: () => t,
  userProcedure: () => userProcedure
});
module.exports = __toCommonJS(trpc_exports);

// src/trpc/context.ts
var import_db = require("@db");
function createContext({
  req,
  res
}) {
  return { req, res, user: req.user, prisma: import_db.prisma };
}
function createWSSContext({
  req
}) {
  return {
    req,
    user: void 0,
    // TODO: implement ws auth logic?
    prisma: import_db.prisma
  };
}

// src/trpc/init.ts
var import_server = require("@trpc/server");
var import_common = require("@common");
var t = import_server.initTRPC.context().create({
  transformer: import_common.superjson
});
var router = t.router;

// src/trpc/middleware.ts
var import_server2 = require("@trpc/server");
var isAuthed = t.middleware(
  ({ ctx, next }) => {
    if (!ctx.user) {
      throw new import_server2.TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }
);
var isAdmin = t.middleware(
  ({ ctx, next }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new import_server2.TRPCError({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adminProcedure,
  createContext,
  createWSSContext,
  isAdmin,
  isAuthed,
  publicProcedure,
  router,
  t,
  userProcedure
});
//# sourceMappingURL=index.js.map