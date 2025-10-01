"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const primitives_1 = require("@common/schemas/primitives");
const trpc_1 = require("../trpc");
const common_1 = require("@quickChat/common");
const profile_1 = require("@common/schemas/profile");
const server_1 = require("@trpc/server");
exports.profileRouter = (0, trpc_1.router)({
    byId: trpc_1.userProcedure
        .input(common_1.z.object({
        profileId: primitives_1.ObjectId,
    }))
        .query(async ({ input, ctx }) => {
        const profile = await ctx.prisma.profile.findUnique({
            where: { id: input.profileId },
        });
        return profile;
    }),
    create: trpc_1.userProcedure
        .input(profile_1.CreateProfileInput)
        .mutation(async ({ input, ctx }) => {
        const { userId, firstName, lastName, profilePictureUrl } = input;
        const { user } = ctx;
        if (userId !== user.id && user.role !== 'ADMIN') {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'Cannot create this profile.',
            });
        }
        const newProfile = await ctx.prisma.profile.create({
            data: {
                user: { connect: { id: userId } },
                firstName,
                lastName,
                profilePictureUrl,
            },
        });
        return newProfile;
    }),
    update: trpc_1.userProcedure
        .input(profile_1.UpdateProfileInput)
        .mutation(async ({ input, ctx }) => {
        const { profileId, firstName, lastName, profilePictureUrl } = input;
        const updatedProfile = await ctx.prisma.profile.update({
            where: { id: profileId },
            data: {
                firstName,
                lastName,
                profilePictureUrl,
            },
        });
        return updatedProfile;
    }),
    getFriends: trpc_1.userProcedure
        .input(common_1.z.object({ profileId: primitives_1.ObjectId }))
        .query(async ({ input, ctx }) => {
        const { profileId } = input;
        const friends = await ctx.prisma.profile.findUnique({
            where: { id: profileId },
            select: {
                friends: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });
        return friends;
    }),
});
