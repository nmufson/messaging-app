"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routers/user.ts
var user_exports = {};
__export(user_exports, {
  userRouter: () => userRouter
});
module.exports = __toCommonJS(user_exports);
var import_server4 = require("@trpc/server");
var import_common2 = require("@common");

// src/services/error.ts
var import_server = require("@trpc/server");

// src/lib/pino.ts
var import_pino = __toESM(require("pino"));
var isDev = process.env.NODE_ENV === "development";
var logger = (0, import_pino.default)({
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
  if (err instanceof import_server.TRPCError) {
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
  throw new import_server.TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: fallbackMessage
  });
}

// src/services/user.ts
var import_db = require("@db");
async function getUserByEmail(email) {
  return import_db.prisma.user.findUnique({ where: { email } });
}
async function getUserById(id) {
  return import_db.prisma.user.findUnique({ where: { id } });
}

// src/trpc/context.ts
var import_db2 = require("@db");

// src/trpc/init.ts
var import_server2 = require("@trpc/server");
var import_common = require("@common");
var t = import_server2.initTRPC.context().create({
  transformer: import_common.superjson
});
var router = t.router;

// src/trpc/middleware.ts
var import_server3 = require("@trpc/server");
var isAuthed = t.middleware(
  ({ ctx, next }) => {
    if (!ctx.user) {
      throw new import_server3.TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }
);
var isAdmin = t.middleware(
  ({ ctx, next }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new import_server3.TRPCError({
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
  getUserById: userProcedure.input(import_common2.z.object({ userId: import_common2.z.string() })).query(async ({ input, ctx }) => {
    const { userId } = input;
    try {
      const user = getUserById(userId);
      return { user };
    } catch (err) {
      handleTRPCError(err, "Failed to retrieve user");
    }
  }),
  getUserByEmail: userProcedure.input(import_common2.z.object({ email: import_common2.z.string().email() })).query(async ({ input, ctx }) => {
    const user = await getUserByEmail(input.email);
    if (!user) {
      throw new import_server4.TRPCError({
        code: "NOT_FOUND",
        message: "No user found with this email"
      });
    }
    return user;
  })
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userRouter
});
//# sourceMappingURL=user.js.map