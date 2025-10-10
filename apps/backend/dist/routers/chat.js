"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const primitives_1 = require("@common/src/schemas/primitives");
const server_1 = require("@trpc/server");
const events_1 = require("events");
const _common_1 = require("@common");
const eventBus_1 = require("../lib/eventBus");
const trpc_1 = require("../trpc");
const mergeAsyncIterators_1 = require("@repo/common/utils/mergeAsyncIterators");
const user_1 = require("@common/src/schemas/user");
const chat_1 = require("@common/src/schemas/chat");
const pino_1 = require("../lib/pino");
exports.chatRouter = (0, trpc_1.router)({
    // TODO: add something for loading more messages in chat
    byId: trpc_1.userProcedure
        .input(_common_1.z.object({
        chatId: primitives_1.ObjectId,
        limit: _common_1.z.number().default(100),
        cursor: primitives_1.ObjectId.optional(),
    }))
        .output(chat_1.ChatDTO)
        .query(async ({ ctx, input }) => {
        const { chatId, limit, cursor } = input;
        const chat = await ctx.prisma.chat.findUnique({
            where: { id: chatId },
            select: {
                id: true,
                type: true,
                name: true,
                groupPictureUrl: true,
                createdAt: true,
                updatedAt: true,
                creatorId: true,
                messages: {
                    take: limit,
                    skip: cursor ? 1 : 0,
                    cursor: cursor ? { id: cursor } : undefined,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        type: true,
                        content: true,
                        createdAt: true,
                        updatedAt: true,
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
        console.log(chat);
        const validatedChat = chat_1.ChatDTO.parse(chat);
        return validatedChat;
    }),
    onNewMessageInChat: trpc_1.userProcedure
        .input(_common_1.z.object({
        profileId: primitives_1.ObjectId,
    }))
        .subscription(async function* ({ input, ctx, signal }) {
        const { profileId } = input;
        const { user } = ctx;
        if (!user)
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED' });
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
        if (!user)
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED' });
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
        if (!user)
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED' });
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
    // TODO: move this to an admin router??
    getAll: trpc_1.adminProcedure
        .input(_common_1.z.object({
        limit: _common_1.z.number().default(100),
    }))
        // .output(ChatDTO.array())
        .query(async ({ ctx }) => {
        pino_1.logger.info('Requesting all chats');
        const chats = await ctx.prisma.chat.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                // messages: {
                //   orderBy: { createdAt: 'desc' },
                //   take: 1, // display most recent msg in preview
                //   select: {
                //     id: true,
                //     type: true,
                //     content: true,
                //     imageUrl: true,
                //     createdAt: true,
                //     updatedAt: true,
                //     senderId: true,
                //   },
                // },
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
        pino_1.logger.info({ chats }, 'Queried all chats');
        const validatedChats = chats.map((chat) => chat_1.ChatDTO.parse(chat));
        return { message: 'test' };
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
                creatorId: creator,
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
//# sourceMappingURL=chat.js.map