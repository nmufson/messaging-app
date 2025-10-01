"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isAuthed = void 0;
const server_1 = require("@trpc/server");
const init_1 = require("./init");
exports.isAuthed = init_1.t.middleware(({ ctx, next }) => {
    if (!ctx.user) {
        throw new server_1.TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
});
exports.isAdmin = init_1.t.middleware(({ ctx, next }) => {
    if (ctx.user?.role !== 'ADMIN') {
        throw new server_1.TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be an admin to access this route',
        });
    }
    return next({ ctx });
});
