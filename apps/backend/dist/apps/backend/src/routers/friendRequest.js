"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendRequestRouter = void 0;
const primitives_1 = require("@common/schemas/primitives");
const trpc_1 = require("../trpc");
const _common_1 = require("@common");
const friendRequest_1 = require("@common/schemas/friendRequest");
const server_1 = require("@trpc/server");
exports.friendRequestRouter = (0, trpc_1.router)({
    sendNew: trpc_1.userProcedure
        .input(_common_1.z.object({
        senderId: primitives_1.ObjectId,
        receiverId: primitives_1.ObjectId,
    }))
        .mutation(async ({ ctx, input }) => {
        const { senderId, receiverId } = input;
        const newRequest = ctx.prisma.friendRequest.create({
            data: {
                senderId,
                receiverId,
            },
        });
        return newRequest;
    }),
    update: trpc_1.userProcedure
        .input(_common_1.z.object({
        newStatus: friendRequest_1.FriendRequestStatus,
        senderId: primitives_1.ObjectId,
        receiverId: primitives_1.ObjectId,
    }))
        .mutation(async ({ ctx, input }) => {
        const { newStatus, senderId, receiverId } = input;
        const latestRequest = await ctx.prisma.friendRequest.findFirst({
            where: {
                senderId,
                receiverId,
                status: friendRequest_1.FriendRequestStatus.enum.PENDING,
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!latestRequest) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'No friend request found.',
            });
        }
        const updatedRequest = await ctx.prisma.friendRequest.update({
            where: { id: latestRequest.id },
            data: { status: newStatus },
        });
        return updatedRequest;
    }),
});
