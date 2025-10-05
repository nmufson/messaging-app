// src/routers/profile.ts
import { ObjectId } from "@common/schemas/primitives";

// src/trpc/context.ts
import { prisma } from "@db";

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

// src/routers/profile.ts
import { z } from "@common";
import {
  CreateProfileInput,
  UpdateProfileInput
} from "@common/schemas/profile";
import { TRPCError as TRPCError2 } from "@trpc/server";
var profileRouter = router({
  byId: userProcedure.input(
    z.object({
      profileId: ObjectId
    })
  ).query(async ({ input, ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { id: input.profileId }
    });
    return profile;
  }),
  create: userProcedure.input(CreateProfileInput).mutation(async ({ input, ctx }) => {
    const { userId, firstName, lastName, profilePictureUrl } = input;
    const { user } = ctx;
    if (!user) throw new TRPCError2({ code: "UNAUTHORIZED" });
    if (userId !== user.id && user.role !== "ADMIN") {
      throw new TRPCError2({
        code: "FORBIDDEN",
        message: "Cannot create this profile."
      });
    }
    const newProfile = await ctx.prisma.profile.create({
      data: {
        user: { connect: { id: userId } },
        firstName,
        lastName,
        profilePictureUrl
      }
    });
    return newProfile;
  }),
  update: userProcedure.input(UpdateProfileInput).mutation(async ({ input, ctx }) => {
    const { profileId, firstName, lastName, profilePictureUrl } = input;
    const updatedProfile = await ctx.prisma.profile.update({
      where: { id: profileId },
      data: {
        firstName,
        lastName,
        profilePictureUrl
      }
    });
    return updatedProfile;
  }),
  getFriends: userProcedure.input(z.object({ profileId: ObjectId })).query(async ({ input, ctx }) => {
    const { profileId } = input;
    const friends = await ctx.prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        friends: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true
          }
        }
      }
    });
    return friends;
  })
});
export {
  profileRouter
};
//# sourceMappingURL=profile.mjs.map