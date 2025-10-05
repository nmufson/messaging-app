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

// src/routers/auth.ts
var auth_exports = {};
__export(auth_exports, {
  authRouter: () => authRouter
});
module.exports = __toCommonJS(auth_exports);

// src/trpc/context.ts
var import_db = require("@db");

// src/trpc/init.ts
var import_server = require("@trpc/server");
var t = import_server.initTRPC.context().create();
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

// src/services/user.ts
var import_db2 = require("@db");
async function getUserByEmail(email) {
  return import_db2.prisma.user.findUnique({ where: { email } });
}

// src/routers/auth.ts
var import_passport = __toESM(require("passport"));
var import_auth = require("@common/schemas/auth");

// src/services/hash.ts
var import_bcrypt = require("bcrypt");
var SALT_ROUNDS = 10;
async function hashPassword(plainTextPassword) {
  return await (0, import_bcrypt.hash)(plainTextPassword, SALT_ROUNDS);
}

// src/routers/auth.ts
var import_server3 = require("@trpc/server");
var authRouter = router({
  register: publicProcedure.input(import_auth.RegisterInput).mutation(async ({ input, ctx }) => {
    const { email, password } = input;
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new import_server3.TRPCError({
        code: "CONFLICT",
        message: "Email already in use"
      });
    }
    const hashedPassword = await hashPassword(password);
    try {
      const user = await ctx.prisma.user.create({
        data: {
          email,
          hashedPassword
        }
      });
      console.log(user, "User created successfully!");
      return { user };
    } catch (err) {
      console.error(err);
      throw new import_server3.TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user"
      });
    }
  }),
  login: publicProcedure.input(import_auth.LogInInput).mutation(async ({ input, ctx }) => {
    return new Promise((resolve, reject) => {
      if ("body" in ctx.req) {
        ctx.req.body = {
          email: input.email,
          password: input.password
        };
      }
      import_passport.default.authenticate("local", (err, user, info) => {
        if (err) return reject(err);
        if (!user) return reject(new Error("Invalid credentials"));
        if ("login" in ctx.req) {
          ctx.req.login(user, (err2) => {
            if (err2) return reject(err2);
            resolve({ user });
          });
        } else {
          throw new import_server3.TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Request object does not support login"
          });
        }
      })(ctx.req, "res" in ctx ? ctx.res : void 0);
    });
  }),
  logout: publicProcedure.mutation(({ ctx }) => {
    if ("logout" in ctx.req && typeof ctx.req.logout === "function") {
      ctx.req.logout(() => {
      });
      return { success: true };
    } else {
      throw new import_server3.TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Request object does not support logout"
      });
    }
  }),
  me: userProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      throw new import_server3.TRPCError({ code: "UNAUTHORIZED" });
    }
    return ctx.user;
  })
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  authRouter
});
//# sourceMappingURL=auth.js.map