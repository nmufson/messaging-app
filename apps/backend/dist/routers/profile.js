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

// src/routers/profile.ts
var profile_exports = {};
__export(profile_exports, {
  profileRouter: () => profileRouter
});
module.exports = __toCommonJS(profile_exports);
var import_primitives = require("@common/schemas/primitives");

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

// src/routers/profile.ts
var import_common = require("@common");
var import_profile = require("@common/schemas/profile");
var import_server3 = require("@trpc/server");
var profileRouter = router({
  byId: userProcedure.input(
    import_common.z.object({
      profileId: import_primitives.ObjectId
    })
  ).query(async ({ input, ctx }) => {
    const profile = await ctx.prisma.profile.findUnique({
      where: { id: input.profileId }
    });
    return profile;
  }),
  create: userProcedure.input(import_profile.CreateProfileInput).mutation(async ({ input, ctx }) => {
    const { userId, firstName, lastName, profilePictureUrl } = input;
    const { user } = ctx;
    if (!user) throw new import_server3.TRPCError({ code: "UNAUTHORIZED" });
    if (userId !== user.id && user.role !== "ADMIN") {
      throw new import_server3.TRPCError({
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
  update: userProcedure.input(import_profile.UpdateProfileInput).mutation(async ({ input, ctx }) => {
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
  getFriends: userProcedure.input(import_common.z.object({ profileId: import_primitives.ObjectId })).query(async ({ input, ctx }) => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  profileRouter
});
//# sourceMappingURL=profile.js.map