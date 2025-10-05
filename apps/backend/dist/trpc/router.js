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

// src/trpc/router.ts
var router_exports = {};
__export(router_exports, {
  appRouter: () => appRouter
});
module.exports = __toCommonJS(router_exports);

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

// src/services/user.ts
var import_db2 = require("@db");
async function getUserByEmail(email) {
  return import_db2.prisma.user.findUnique({ where: { email } });
}
async function getUserById(id) {
  return import_db2.prisma.user.findUnique({ where: { id } });
}

// src/routers/auth.ts
var import_passport = __toESM(require("passport"));
var import_auth = require("@common/schemas/auth");

// src/services/hash.ts
var import_bcrypt = require("bcrypt");
var SALT_ROUNDS = 10;
async function hashPassword(plainTextPassword) {
  return await (0, import_bcrypt.hash)(plainTextPassword, SALT_ROUNDS);
}

// src/routers/auth.ts
var import_server3 = require("@trpc/server");
var authRouter = router({
  register: publicProcedure.input(import_auth.RegisterInput).mutation(async ({ input, ctx }) => {
    const { email, password } = input;
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new import_server3.TRPCError({
        code: "CONFLICT",
        message: "Email already in use"
      });
    }
    const hashedPassword = await hashPassword(password);
    try {
      const user = await ctx.prisma.user.create({
        data: {
          email,
          hashedPassword
        }
      });
      console.log(user, "User created successfully!");
      return { user };
    } catch (err) {
      console.error(err);
      throw new import_server3.TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user"
      });
    }
  }),
  login: publicProcedure.input(import_auth.LogInInput).mutation(async ({ input, ctx }) => {
    return new Promise((resolve, reject) => {
      if ("body" in ctx.req) {
        ctx.req.body = {
          email: input.email,
          password: input.password
        };
      }
      import_passport.default.authenticate("local", (err, user, info) => {
        if (err) return reject(err);
        if (!user) return reject(new Error("Invalid credentials"));
        if ("login" in ctx.req) {
          ctx.req.login(user, (err2) => {
            if (err2) return reject(err2);
            resolve({ user });
          });
        } else {
          throw new import_server3.TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Request object does not support login"
          });
        }
      })(ctx.req, "res" in ctx ? ctx.res : void 0);
    });
  }),
  logout: publicProcedure.mutation(({ ctx }) => {
    if ("logout" in ctx.req && typeof ctx.req.logout === "function") {
      ctx.req.logout(() => {
      });
      return { success: true };
    } else {
      throw new import_server3.TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Request object does not support logout"
      });
    }
  }),
  me: userProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      throw new import_server3.TRPCError({ code: "UNAUTHORIZED" });
    }
    return ctx.user;
  })
});

// src/routers/chat.ts
var import_primitives = require("@common/schemas/primitives");
var import_server4 = require("@trpc/server");
var import_events2 = require("events");
var import_common = require("@common");

// src/lib/eventBus.ts
var import_events = __toESM(require("events"));
var eventEmitter = new import_events.default();

// src/routers/chat.ts
var import_mergeAsyncIterators = require("@common/utils/mergeAsyncIterators");
var import_user2 = require("@common/schemas/user");
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
      throw new import_server4.TRPCError({
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
    if (!user) throw new import_server4.TRPCError({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== "ADMIN") {
      throw new import_server4.TRPCError({ code: "FORBIDDEN" });
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
      throw new import_server4.TRPCError({ code: "NOT_FOUND" });
    }
    const iterables = profile.chats.map(
      ({ id }) => (0, import_events2.on)(eventEmitter, `addMessageToChat:${id}`, { signal })
    );
    for await (const [message] of (0, import_mergeAsyncIterators.mergeAsyncIterators)(iterables)) {
      yield (0, import_server4.tracked)(message.id, message);
    }
  }),
  onNewChat: userProcedure.input(
    import_common.z.object({
      profileId: import_primitives.ObjectId
    })
  ).subscription(async function* ({ input, ctx, signal }) {
    const { profileId } = input;
    const { user } = ctx;
    if (!user) throw new import_server4.TRPCError({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== import_user2.UserRole.enum.ADMIN) {
      throw new import_server4.TRPCError({ code: "FORBIDDEN" });
    }
    for await (const [newChat] of (0, import_events2.on)(eventEmitter, `newChat:${profileId}`, {
      signal
    })) {
      yield (0, import_server4.tracked)(newChat.id, newChat);
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
    if (!user) throw new import_server4.TRPCError({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== import_user2.UserRole.enum.ADMIN) {
      throw new import_server4.TRPCError({
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
      throw new import_server4.TRPCError({
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

// src/routers/friendRequest.ts
var import_primitives2 = require("@common/schemas/primitives");
var import_common2 = require("@common");
var import_friendRequest = require("@common/schemas/friendRequest");
var import_server5 = require("@trpc/server");
var friendRequestRouter = router({
  sendNew: userProcedure.input(
    import_common2.z.object({
      senderId: import_primitives2.ObjectId,
      receiverId: import_primitives2.ObjectId
    })
  ).mutation(async ({ ctx, input }) => {
    const { senderId, receiverId } = input;
    const newRequest = ctx.prisma.friendRequest.create({
      data: {
        senderId,
        receiverId
      }
    });
    return newRequest;
  }),
  update: userProcedure.input(
    import_common2.z.object({
      newStatus: import_friendRequest.FriendRequestStatus,
      senderId: import_primitives2.ObjectId,
      receiverId: import_primitives2.ObjectId
    })
  ).mutation(async ({ ctx, input }) => {
    const { newStatus, senderId, receiverId } = input;
    const latestRequest = await ctx.prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: import_friendRequest.FriendRequestStatus.enum.PENDING
      },
      orderBy: { createdAt: "desc" }
    });
    if (!latestRequest) {
      throw new import_server5.TRPCError({
        code: "NOT_FOUND",
        message: "No friend request found."
      });
    }
    const updatedRequest = await ctx.prisma.friendRequest.update({
      where: { id: latestRequest.id },
      data: { status: newStatus }
    });
    return updatedRequest;
  })
});

// src/routers/image.ts
var import_cloudinary = require("cloudinary");
var imageRouter = router({
  getImageUploadSignature: userProcedure.mutation(async () => {
    const timestamp = Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3);
    const signature = import_cloudinary.v2.utils.api_sign_request(
      { timestamp },
      process.env.CLOUDINARY_API_SECRET
    );
    return {
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    };
  })
});

// src/routers/message.ts
var import_primitives3 = require("@common/schemas/primitives");
var import_message = require("@common/schemas/message");
var import_server6 = require("@trpc/server");
var import_common3 = require("@common");

// src/services/chat.ts
var import_chat2 = require("@common/schemas/chat");
var findOrCreateDirectChat = async (prisma3, senderId, receiverId) => {
  const existingChat = await prisma3.chat.findFirst({
    where: {
      type: import_chat2.ChatType.enum.DIRECT,
      participants: {
        every: {
          id: { in: [senderId, receiverId] }
        },
        some: {
          id: senderId
        }
      }
    },
    include: { participants: true }
  });
  if (existingChat && existingChat.participants.length === 2) {
    return { chat: existingChat, isNewChat: false };
  }
  const newChat = await prisma3.chat.create({
    data: {
      type: "DIRECT",
      creatorId: senderId,
      participants: {
        connect: [{ id: senderId }, { id: receiverId }]
      }
    }
  });
  return { chat: newChat, isNewChat: true };
};

// src/services/message.ts
var sendMessage = async (prisma3, params) => {
  const { chatId, sender, type, content, imageUrl } = params;
  return await prisma3.message.create({
    data: {
      type,
      content,
      imageUrl,
      sender: { connect: { id: sender } },
      chat: { connect: { id: chatId } }
    }
  });
};

// src/routers/message.ts
var import_events3 = require("events");
var messageRouter = router({
  onNewMessage: userProcedure.input(
    import_common3.z.object({
      chatId: import_primitives3.ObjectId,
      lastMessageId: import_primitives3.ObjectId.nullish()
    })
  ).subscription(async function* ({ input, ctx, signal }) {
    const { lastMessageId, chatId } = input;
    if (lastMessageId) {
      const lastMessage = await ctx.prisma.message.findUnique({
        where: { id: lastMessageId }
      });
      if (lastMessage) {
        const missedMessages = await ctx.prisma.message.findMany({
          where: {
            chatId,
            // query all messages created after our lastMessage
            createdAt: { gt: lastMessage.createdAt }
          },
          orderBy: { createdAt: "asc" }
        });
        for (const msg of missedMessages) {
          yield (0, import_server6.tracked)(msg.id, msg);
        }
      }
    }
    for await (const [message] of (0, import_events3.on)(
      eventEmitter,
      `addMessageToChat:${chatId}`,
      {
        signal
      }
    )) {
      yield (0, import_server6.tracked)(message.id, message);
    }
  }),
  sendDirect: userProcedure.input(
    import_common3.z.object({
      sender: import_primitives3.ObjectId,
      receiver: import_primitives3.ObjectId,
      type: import_message.MessageType,
      content: import_common3.z.string().nullable(),
      imageUrl: import_common3.z.string().nullable()
    })
  ).mutation(async ({ input, ctx }) => {
    const { sender, receiver, content, imageUrl, type } = input;
    const { chat, isNewChat } = await findOrCreateDirectChat(
      ctx.prisma,
      sender,
      receiver
    );
    if (!chat) {
      throw new import_server6.TRPCError({
        code: "NOT_FOUND",
        message: "chat not found or could not be created"
      });
    }
    const newDirectMessage = await sendMessage(ctx.prisma, {
      ...input,
      chatId: chat.id
    });
    if (isNewChat) {
      eventEmitter.emit(`newChat:${sender}`, chat);
      eventEmitter.emit(`newChat:${receiver}`, chat);
    }
    return { chat, newDirectMessage };
  }),
  sendTochat: userProcedure.input(import_message.SendMessageInput).query(async ({ input, ctx }) => {
    const { sender, chatId, content, imageUrl, type } = input;
    const chat = await ctx.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true
      }
    });
    if (!chat) {
      throw new import_server6.TRPCError({
        code: "NOT_FOUND",
        message: "chat not found"
      });
    }
    if (!chat.participants.some((p) => p.id === sender)) {
      throw new import_server6.TRPCError({
        code: "FORBIDDEN",
        message: "User is not a participant in this chat"
      });
    }
    const newMessage = await sendMessage(ctx.prisma, input);
    eventEmitter.emit(`addMessageToChat:${chatId}`, newMessage);
    return { newMessage };
  })
});

// src/routers/user.ts
var import_server8 = require("@trpc/server");
var import_common4 = require("@common");

// src/services/error.ts
var import_server7 = require("@trpc/server");
function handleTRPCError(err, fallbackMessage = "An error occured", context) {
  if (err instanceof import_server7.TRPCError) {
    throw err;
  }
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : void 0;
  logger.error(
    {
      error: errorMessage,
      stack: errorStack,
      ...context
    },
    fallbackMessage
  );
  throw new import_server7.TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: fallbackMessage
  });
}

// src/routers/user.ts
var userRouter = router({
  getUserById: userProcedure.input(import_common4.z.object({ userId: import_common4.z.string() })).query(async ({ input, ctx }) => {
    const { userId } = input;
    try {
      const user = getUserById(userId);
      return { user };
    } catch (err) {
      handleTRPCError(err, "Failed to retrieve user");
    }
  }),
  getUserByEmail: userProcedure.input(import_common4.z.object({ email: import_common4.z.string().email() })).query(async ({ input, ctx }) => {
    const user = await getUserByEmail(input.email);
    if (!user) {
      throw new import_server8.TRPCError({
        code: "NOT_FOUND",
        message: "No user found with this email"
      });
    }
    return user;
  })
});

// src/trpc/router.ts
var appRouter = router({
  auth: authRouter,
  user: userRouter,
  chat: chatRouter,
  friendRequest: friendRequestRouter,
  message: messageRouter,
  image: imageRouter
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  appRouter
});
//# sourceMappingURL=router.js.map