import {
  hashPassword
} from "./chunk-Q6YATOVP.mjs";
import {
  getUserByEmail
} from "./chunk-7RA4MHFF.mjs";
import {
  publicProcedure,
  userProcedure
} from "./chunk-ZAYRUBIM.mjs";
import {
  router
} from "./chunk-XI2LZ4T3.mjs";

// src/routers/auth.ts
import passport from "passport";
import { LogInInput, RegisterInput } from "@common/schemas/auth";
import { TRPCError } from "@trpc/server";
var authRouter = router({
  register: publicProcedure.input(RegisterInput).mutation(async ({ input, ctx }) => {
    const { email, password } = input;
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new TRPCError({
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
      throw new TRPCError({
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
          throw new TRPCError({
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
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Request object does not support logout"
      });
    }
  }),
  me: userProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return ctx.user;
  })
});

export {
  authRouter
};
