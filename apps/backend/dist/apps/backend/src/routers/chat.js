"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const primitives_1 = require("@common/schemas/primitives");
const server_1 = require("@trpc/server");
const events_1 = require("events");
const _common_1 = require("@common");
const eventBus_1 = require("../lib/eventBus");
const error_1 = require("../services/error");
const trpc_1 = require("../trpc");
const mergeAsyncIterators_1 = require("@common/utils/mergeAsyncIterators");
const user_1 = require("@common/schemas/user");
const chat_1 = require("@common/schemas/chat");
exports.chatRouter = (0, trpc_1.router)({
    byId: trpc_1.userProcedure
        .input(_common_1.z.object({
        chatId: primitives_1.ObjectId,
        limit: _common_1.z.number().default(100),
        cursor: primitives_1.ObjectId.optional(),
    }))
        .query(async ({ ctx, input }) => {
        const { chatId, limit, cursor } = input;
        const chat = await ctx.prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                messages: {
                    take: limit,
                    skip: cursor ? 1 : 0,
                    cursor: cursor ? { id: cursor } : undefined,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        type: true,
                        content: true,
                        imageUrl: true,
                        senderId: true,
                    },
                },
                participants: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profilePictureUrl: true,
                    },
                },
            },
        });
        if (!chat) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Chat not found',
            });
        }
        return chat;
    }),
    onNewMessageInChat: trpc_1.userProcedure
        .input(_common_1.z.object({
        profileId: primitives_1.ObjectId,
    }))
        .subscription(async function* ({ input, ctx, signal }) {
        const { profileId } = input;
        const { user } = ctx;
        if (user.id !== profileId && user.role !== 'ADMIN') {
            throw new server_1.TRPCError({ code: 'FORBIDDEN' });
        }
        const profile = await ctx.prisma.profile.findUnique({
            where: { id: profileId },
            include: {
                chats: {
                    select: {
                        id: true,
                    },
                },
            },
        });
        if (!profile) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND' });
        }
        const iterables = profile.chats.map(({ id }) => (0, events_1.on)(eventBus_1.eventEmitter, `addMessageToChat:${id}`, { signal }));
        for await (const [message] of (0, mergeAsyncIterators_1.mergeAsyncIterators)(iterables)) {
            yield (0, server_1.tracked)(message.id, message);
        }
    }),
    onNewChat: trpc_1.userProcedure
        .input(_common_1.z.object({
        profileId: primitives_1.ObjectId,
    }))
        .subscription(async function* ({ input, ctx, signal }) {
        const { profileId } = input;
        const { user } = ctx;
        if (user.id !== profileId && user.role !== user_1.UserRole.enum.ADMIN) {
            throw new server_1.TRPCError({ code: 'FORBIDDEN' });
        }
        for await (const [newChat] of (0, events_1.on)(eventBus_1.eventEmitter, `newChat:${profileId}`, {
            signal,
        })) {
            yield (0, server_1.tracked)(newChat.id, newChat);
        }
    }),
    getList: trpc_1.userProcedure
        .input(_common_1.z.object({
        profileId: _common_1.z.string(),
        limit: _common_1.z.number().default(100),
    }))
        .query(async ({ input, ctx }) => {
        const { profileId, limit } = input;
        const { user } = ctx;
        if (user.id !== profileId && user.role !== user_1.UserRole.enum.ADMIN) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: "Not allowed to view this profile's chat",
            });
        }
        const profile = await ctx.prisma.profile.findUnique({
            where: { id: profileId },
            include: {
                chats: {
                    take: limit,
                    orderBy: { updatedAt: 'desc' },
                    include: {
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1, // for displaying most recent msg in list
                            select: {
                                content: true,
                            },
                            include: {
                                sender: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                    },
                                },
                            },
                        },
                        participants: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                },
            },
        });
        if (!profile) {
            throw new server_1.TRPCError({
                code: 'NOT_FOUND',
                message: 'Profile not found',
            });
        }
        return profile.chats;
    }),
    getAll: trpc_1.adminProcedure
        .input(_common_1.z.object({
        limit: _common_1.z.number().default(100),
    }))
        .query(async ({ ctx }) => {
        try {
            const chats = await ctx.prisma.chat.findMany({
                orderBy: { updatedAt: 'desc' },
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1, // for displaying most recent msg in list
                        include: {
                            sender: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                    participants: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            profilePictureUrl: true,
                        },
                    },
                },
            });
            return { chats };
        }
        catch (err) {
            (0, error_1.handleTRPCError)(err, 'Failed to retrieve chats');
        }
    }),
    createGroup: trpc_1.userProcedure
        .input(_common_1.z.object({
        creator: primitives_1.ObjectId,
        participants: primitives_1.ObjectId.array(),
    }))
        .mutation(async ({ input, ctx }) => {
        const { creator, participants } = input;
        const chat = await ctx.prisma.chat.create({
            data: {
                creator,
                type: chat_1.ChatType.enum.GROUP,
                participants: {
                    connect: participants.map((id) => ({ id })),
                },
            },
        });
        participants.forEach((userId) => {
            eventBus_1.eventEmitter.emit(`newChat:${userId}`, chat);
        });
        return chat;
    }),
});
