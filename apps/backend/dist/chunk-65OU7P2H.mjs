import {
  handleTRPCError
} from "./chunk-SMJXUA4B.mjs";
import {
  getUserByEmail,
  getUserById
} from "./chunk-7RA4MHFF.mjs";
import {
  userProcedure
} from "./chunk-ZAYRUBIM.mjs";
import {
  router
} from "./chunk-XI2LZ4T3.mjs";

// src/routers/user.ts
import { TRPCError } from "@trpc/server";
import { z } from "@common";
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
      throw new TRPCError({
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
