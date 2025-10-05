"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routers/chat.ts
var chat_exports = {};
__export(chat_exports, {
  chatRouter: () => chatRouter
});
module.exports = __toCommonJS(chat_exports);
var import_primitives = require("@common/schemas/primitives");
var import_server3 = require("@trpc/server");
var import_events2 = require("events");
var import_common = require("@common");

// src/lib/eventBus.ts
var import_events = __toESM(require("events"));
var eventEmitter = new import_events.default();

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

// src/routers/chat.ts
var import_mergeAsyncIterators = require("@common/utils/mergeAsyncIterators");
var import_user = require("@common/schemas/user");
var import_chat = require("@common/schemas/chat");

// src/lib/pino.ts
var import_pino = __toESM(require("pino"));
var isDev = process.env.NODE_ENV === "development";
var logger = (0, import_pino.default)({
  level: isDev ? "debug" : "info",
  ...isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname"
      }
    }
  },
  ...process.env.NODE_ENV === "production" && {
    formatters: {
      level: (label) => ({ level: label })
    }
  }
});

// src/routers/chat.ts
var chatRouter = router({
  byId: userProcedure.input(
    import_common.z.object({
      chatId: import_primitives.ObjectId,
      limit: import_common.z.number().default(100),
      cursor: import_primitives.ObjectId.optional()
    })
  ).query(async ({ ctx, input }) => {
    const { chatId, limit, cursor } = input;
    const chat = await ctx.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          take: limit,
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : void 0,
          orderBy: { createdAt: "desc" },
          select: {
            type: true,
            content: true,
            imageUrl: true,
            senderId: true
          }
        },
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true
          }
        }
      }
    });
    if (!chat) {
      throw new import_server3.TRPCError({
        code: "NOT_FOUND",
        message: "Chat not found"
      });
    }
    return chat;
  }),
  onNewMessageInChat: userProcedure.input(
    import_common.z.object({
      profileId: import_primitives.ObjectId
    })
  ).subscription(async function* ({ input, ctx, signal }) {
    const { profileId } = input;
    const { user } = ctx;
    if (!user) throw new import_server3.TRPCError({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== "ADMIN") {
      throw new import_server3.TRPCError({ code: "FORBIDDEN" });
    }
    const profile = await ctx.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        chats: {
          select: {
            id: true
          }
        }
      }
    });
    if (!profile) {
      throw new import_server3.TRPCError({ code: "NOT_FOUND" });
    }
    const iterables = profile.chats.map(
      ({ id }) => (0, import_events2.on)(eventEmitter, `addMessageToChat:${id}`, { signal })
    );
    for await (const [message] of (0, import_mergeAsyncIterators.mergeAsyncIterators)(iterables)) {
      yield (0, import_server3.tracked)(message.id, message);
    }
  }),
  onNewChat: userProcedure.input(
    import_common.z.object({
      profileId: import_primitives.ObjectId
    })
  ).subscription(async function* ({ input, ctx, signal }) {
    const { profileId } = input;
    const { user } = ctx;
    if (!user) throw new import_server3.TRPCError({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== import_user.UserRole.enum.ADMIN) {
      throw new import_server3.TRPCError({ code: "FORBIDDEN" });
    }
    for await (const [newChat] of (0, import_events2.on)(eventEmitter, `newChat:${profileId}`, {
      signal
    })) {
      yield (0, import_server3.tracked)(newChat.id, newChat);
    }
  }),
  getList: userProcedure.input(
    import_common.z.object({
      profileId: import_common.z.string(),
      limit: import_common.z.number().default(100)
    })
  ).query(async ({ input, ctx }) => {
    const { profileId, limit } = input;
    const { user } = ctx;
    if (!user) throw new import_server3.TRPCError({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== import_user.UserRole.enum.ADMIN) {
      throw new import_server3.TRPCError({
        code: "FORBIDDEN",
        message: "Not allowed to view this profile's chat"
      });
    }
    const profile = await ctx.prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        chats: {
          take: limit,
          orderBy: { updatedAt: "desc" },
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              // for displaying most recent msg in list
              select: {
                content: true
              },
              include: {
                sender: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            participants: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePictureUrl: true
              }
            }
          }
        }
      }
    });
    if (!profile) {
      throw new import_server3.TRPCError({
        code: "NOT_FOUND",
        message: "Profile not found"
      });
    }
    return profile.chats;
  }),
  // TODO: move this to an admin router??
  getAll: adminProcedure.input(
    import_common.z.object({
      limit: import_common.z.number().default(100)
    })
  ).output(import_chat.ChatDTO.array()).query(async ({ ctx }) => {
    logger.info("Requesting all chats");
    const chats = await ctx.prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          // display most recent msg in preview
          include: {
            sender: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        participants: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    const transformedChats = chats.map((chat) => ({
      id: chat.id,
      type: chat.type,
      createdAt: chat.createdAt.toISOString(),
      // ✅ Convert Date to string
      updatedAt: chat.updatedAt?.toISOString(),
      // ✅ Convert Date to string
      participants: chat.participants,
      lastMessage: chat.messages[0] ? {
        content: chat.messages[0].content || "",
        sender: chat.messages[0].sender
      } : void 0,
      name: chat.name,
      groupPictureUrl: chat.groupPictureUrl,
      creator: chat.creator
    }));
    console.log("Transformed chats sample:", transformedChats[0]);
    return transformedChats;
  }),
  createGroup: userProcedure.input(
    import_common.z.object({
      creator: import_primitives.ObjectId,
      participants: import_primitives.ObjectId.array()
    })
  ).mutation(async ({ input, ctx }) => {
    const { creator, participants } = input;
    const chat = await ctx.prisma.chat.create({
      data: {
        creatorId: creator,
        type: import_chat.ChatType.enum.GROUP,
        participants: {
          connect: participants.map((id) => ({ id }))
        }
      }
    });
    participants.forEach((userId) => {
      eventEmitter.emit(`newChat:${userId}`, chat);
    });
    return chat;
  })
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  chatRouter
});
//# sourceMappingURL=chat.js.map