// src/trpc/context.ts
import { prisma } from "@db";

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

// src/services/user.ts
import { prisma as prisma2 } from "@db";
async function getUserByEmail(email) {
  return prisma2.user.findUnique({ where: { email } });
}

// src/routers/auth.ts
import passport from "passport";
import { LogInInput, RegisterInput } from "@common/schemas/auth";

// src/services/hash.ts
import { hash, compare } from "bcrypt";
var SALT_ROUNDS = 10;
async function hashPassword(plainTextPassword) {
  return await hash(plainTextPassword, SALT_ROUNDS);
}

// src/routers/auth.ts
import { TRPCError as TRPCError2 } from "@trpc/server";
var authRouter = router({
  register: publicProcedure.input(RegisterInput).mutation(async ({ input, ctx }) => {
    const { email, password } = input;
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new TRPCError2({
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
      throw new TRPCError2({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user"
      });
    }
  }),
  login: publicProcedure.input(LogInInput).mutation(async ({ input, ctx }) => {
    return new Promise((resolve, reject) => {
      if ("body" in ctx.req) {
        ctx.req.body = {
          email: input.email,
          password: input.password
        };
      }
      passport.authenticate("local", (err, user, info) => {
        if (err) return reject(err);
        if (!user) return reject(new Error("Invalid credentials"));
        if ("login" in ctx.req) {
          ctx.req.login(user, (err2) => {
            if (err2) return reject(err2);
            resolve({ user });
          });
        } else {
          throw new TRPCError2({
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
      throw new TRPCError2({
        code: "INTERNAL_SERVER_ERROR",
        message: "Request object does not support logout"
      });
    }
  }),
  me: userProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError2({ code: "UNAUTHORIZED" });
    }
    return ctx.user;
  })
});
export {
  authRouter
};
//# sourceMappingURL=auth.mjs.map