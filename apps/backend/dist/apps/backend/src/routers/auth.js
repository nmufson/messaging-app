"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const trpc_1 = require("../trpc");
const user_1 = require("../services/user");
const passport_1 = __importDefault(require("passport"));
const auth_1 = require("@common/schemas/auth");
const hash_1 = require("../services/hash");
const server_1 = require("@trpc/server");
exports.authRouter = (0, trpc_1.router)({
    register: trpc_1.publicProcedure
        .input(auth_1.RegisterInput)
        .mutation(async ({ input, ctx }) => {
        const { email, password } = input;
        const existingUser = await (0, user_1.getUserByEmail)(email);
        if (existingUser) {
            throw new server_1.TRPCError({
                code: 'CONFLICT',
                message: 'Email already in use',
            });
        }
        const hashedPassword = await (0, hash_1.hashPassword)(password);
        try {
            const user = await ctx.prisma.user.create({
                data: {
                    email,
                    hashedPassword,
                },
            });
            console.log(user, 'User created successfully!');
            return { user };
        }
        catch (err) {
            console.error(err);
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create user',
            });
        }
    }),
    login: trpc_1.publicProcedure.input(auth_1.LogInInput).mutation(async ({ input, ctx }) => {
        return new Promise((resolve, reject) => {
            if ('body' in ctx.req) {
                ctx.req.body = {
                    email: input.email,
                    password: input.password,
                };
            }
            passport_1.default.authenticate('local', (err, user, info) => {
                if (err)
                    return reject(err);
                if (!user)
                    return reject(new Error('Invalid credentials'));
                // !
                // TODO: figure out better way to handle this
                // !
                if ('login' in ctx.req) {
                    ctx.req.login(user, (err) => {
                        if (err)
                            return reject(err);
                        resolve({ user });
                    });
                }
                else {
                    throw new server_1.TRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Request object does not support login',
                    });
                }
            })(ctx.req, 'res' in ctx ? ctx.res : undefined);
        });
    }),
    logout: trpc_1.publicProcedure.mutation(({ ctx }) => {
        // !
        // TODO: figure out better way to handle this
        // !
        if ('logout' in ctx.req && typeof ctx.req.logout === 'function') {
            ctx.req.logout(() => { });
            return { success: true };
        }
        else {
            throw new server_1.TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Request object does not support logout',
            });
        }
    }),
    me: trpc_1.userProcedure.query(({ ctx }) => {
        if (!ctx.user) {
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED' });
        }
        return ctx.user;
    }),
});
