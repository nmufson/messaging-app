"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const server_1 = require("@trpc/server");
const _common_1 = require("@common");
const error_1 = require("../services/error");
const user_1 = require("../services/user");
const trpc_1 = require("../trpc");
exports.userRouter = (0, trpc_1.router)({
    getUserById: trpc_1.userProcedure
        .input(_common_1.z.object({ userId: _common_1.z.string() }))
        .query(async ({ input, ctx }) => {
        const { userId } = input;
        try {
            const user = (0, user_1.getUserById)(userId);
            return { user };
        }
        catch (err) {
            (0, error_1.handleTRPCError)(err, 'Failed to retrieve user');
        }
    }),
    getUserByEmail: trpc_1.userProcedure
        .input(_common_1.z.object({ email: _common_1.z.string().email() }))
        .query(async ({ input, ctx }) => {
        const user = await (0, user_1.getUserByEmail)(input.email);
        if (!user) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'No user found with this email',
            });
        }
        return user;
    }),
});
