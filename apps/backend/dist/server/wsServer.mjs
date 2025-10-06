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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));

// src/server/wsServer.ts
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";

// src/trpc/context.ts
import { prisma } from "@db";
function createContext({
  req,
  res
}) {
  return { req, res, user: req.user, prisma };
}
function createWSSContext({
  req
}) {
  return {
    req,
    user: void 0,
    // TODO: implement ws auth logic?
    prisma
  };
}

// src/trpc/init.ts
import { initTRPC } from "@trpc/server";
import { superjson } from "@common";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;

// src/trpc/middleware.ts
import { TRPCError } from "@trpc/server";
var isAuthed = t.middleware(
  ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }
);
var isAdmin = t.middleware(
  ({ ctx, next }) => {
    if (ctx.user?.role !== "ADMIN") {
      throw new TRPCError({
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
import { prisma as prisma2 } from "@db";
async function getUserByEmail(email) {
  return prisma2.user.findUnique({ where: { email } });
}
async function getUserById(id) {
  return prisma2.user.findUnique({ where: { id } });
}

// src/routers/auth.ts
import passport from "passport";
import { LogInInput, RegisterInput } from "@common/schemas/auth";

// src/services/hash.ts
import { hash, compare } from "bcrypt";
var SALT_ROUNDS = 10;
async function hashPassword(plainTextPassword) {
  return await hash(plainTextPassword, SALT_ROUNDS);
}
async function verifyPassword(user, plainTextPassword) {
  const { hashedPassword } = user;
  return await compare(plainTextPassword, hashedPassword);
}

// src/routers/auth.ts
import { TRPCError as TRPCError2 } from "@trpc/server";
var authRouter = router({
  register: publicProcedure.input(RegisterInput).mutation(async ({ input, ctx }) => {
    const { email, password } = input;
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new TRPCError2({
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
      throw new TRPCError2({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user"
      });
    }
  }),
  login: publicProcedure.input(LogInInput).mutation(async ({ input, ctx }) => {
    return new Promise((resolve, reject) => {
      if ("body" in ctx.req) {
        ctx.req.body = {
          email: input.email,
          password: input.password
        };
      }
      passport.authenticate("local", (err, user, info) => {
        if (err) return reject(err);
        if (!user) return reject(new Error("Invalid credentials"));
        if ("login" in ctx.req) {
          ctx.req.login(user, (err2) => {
            if (err2) return reject(err2);
            resolve({ user });
          });
        } else {
          throw new TRPCError2({
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
      throw new TRPCError2({
        code: "INTERNAL_SERVER_ERROR",
        message: "Request object does not support logout"
      });
    }
  }),
  me: userProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError2({ code: "UNAUTHORIZED" });
    }
    return ctx.user;
  })
});

// src/routers/chat.ts
import { ObjectId } from "@common/schemas/primitives";
import { tracked, TRPCError as TRPCError3 } from "@trpc/server";
import { on } from "events";
import { z } from "@common";

// src/lib/eventBus.ts
import EventEmitter from "events";
var eventEmitter = new EventEmitter();

// src/routers/chat.ts
import { mergeAsyncIterators } from "@common/utils/mergeAsyncIterators";
import { UserRole } from "@common/schemas/user";
import { ChatDTO, ChatType } from "@common/schemas/chat";

// src/lib/pino.ts
import pino from "pino";
var isDev = process.env.NODE_ENV === "development";
var logger = pino({
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
    z.object({
      chatId: ObjectId,
      limit: z.number().default(100),
      cursor: ObjectId.optional()
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
      throw new TRPCError3({
        code: "NOT_FOUND",
        message: "Chat not found"
      });
    }
    return chat;
  }),
  onNewMessageInChat: userProcedure.input(
    z.object({
      profileId: ObjectId
    })
  ).subscription(async function* ({ input, ctx, signal }) {
    const { profileId } = input;
    const { user } = ctx;
    if (!user) throw new TRPCError3({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== "ADMIN") {
      throw new TRPCError3({ code: "FORBIDDEN" });
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
      throw new TRPCError3({ code: "NOT_FOUND" });
    }
    const iterables = profile.chats.map(
      ({ id }) => on(eventEmitter, `addMessageToChat:${id}`, { signal })
    );
    for await (const [message] of mergeAsyncIterators(iterables)) {
      yield tracked(message.id, message);
    }
  }),
  onNewChat: userProcedure.input(
    z.object({
      profileId: ObjectId
    })
  ).subscription(async function* ({ input, ctx, signal }) {
    const { profileId } = input;
    const { user } = ctx;
    if (!user) throw new TRPCError3({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== UserRole.enum.ADMIN) {
      throw new TRPCError3({ code: "FORBIDDEN" });
    }
    for await (const [newChat] of on(eventEmitter, `newChat:${profileId}`, {
      signal
    })) {
      yield tracked(newChat.id, newChat);
    }
  }),
  getList: userProcedure.input(
    z.object({
      profileId: z.string(),
      limit: z.number().default(100)
    })
  ).query(async ({ input, ctx }) => {
    const { profileId, limit } = input;
    const { user } = ctx;
    if (!user) throw new TRPCError3({ code: "UNAUTHORIZED" });
    if (user.id !== profileId && user.role !== UserRole.enum.ADMIN) {
      throw new TRPCError3({
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
      throw new TRPCError3({
        code: "NOT_FOUND",
        message: "Profile not found"
      });
    }
    return profile.chats;
  }),
  // TODO: move this to an admin router??
  getAll: adminProcedure.input(
    z.object({
      limit: z.number().default(100)
    })
  ).output(ChatDTO.array()).query(async ({ ctx }) => {
    logger.info("Requesting all chats");
    const chats = await ctx.prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          // display most recent msg in preview
          select: {
            content: true,
            createdAt: true,
            type: true,
            sender: {
              select: {
                firstName: true,
                lastName: true,
                profilePictureUrl: true
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
            lastName: true,
            profilePictureUrl: true
          }
        }
      }
    });
    return chats;
  }),
  createGroup: userProcedure.input(
    z.object({
      creator: ObjectId,
      participants: ObjectId.array()
    })
  ).mutation(async ({ input, ctx }) => {
    const { creator, participants } = input;
    const chat = await ctx.prisma.chat.create({
      data: {
        creatorId: creator,
        type: ChatType.enum.GROUP,
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
import { ObjectId as ObjectId2 } from "@common/schemas/primitives";
import { z as z2 } from "@common";
import { FriendRequestStatus } from "@common/schemas/friendRequest";
import { TRPCError as TRPCError4 } from "@trpc/server";
var friendRequestRouter = router({
  sendNew: userProcedure.input(
    z2.object({
      senderId: ObjectId2,
      receiverId: ObjectId2
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
    z2.object({
      newStatus: FriendRequestStatus,
      senderId: ObjectId2,
      receiverId: ObjectId2
    })
  ).mutation(async ({ ctx, input }) => {
    const { newStatus, senderId, receiverId } = input;
    const latestRequest = await ctx.prisma.friendRequest.findFirst({
      where: {
        senderId,
        receiverId,
        status: FriendRequestStatus.enum.PENDING
      },
      orderBy: { createdAt: "desc" }
    });
    if (!latestRequest) {
      throw new TRPCError4({
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
import { v2 as cloudinary } from "cloudinary";
var imageRouter = router({
  getImageUploadSignature: userProcedure.mutation(async () => {
    const timestamp = Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3);
    const signature = cloudinary.utils.api_sign_request(
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
import { ObjectId as ObjectId3 } from "@common/schemas/primitives";
import { MessageType, SendMessageInput } from "@common/schemas/message";
import { tracked as tracked2, TRPCError as TRPCError5 } from "@trpc/server";
import { z as z3 } from "@common";

// src/services/chat.ts
import { ChatType as ChatType2 } from "@common/schemas/chat";
var findOrCreateDirectChat = async (prisma4, senderId, receiverId) => {
  const existingChat = await prisma4.chat.findFirst({
    where: {
      type: ChatType2.enum.DIRECT,
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
  const newChat = await prisma4.chat.create({
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
var sendMessage = async (prisma4, params) => {
  const { chatId, sender, type, content, imageUrl } = params;
  return await prisma4.message.create({
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
import { on as on2 } from "events";
var messageRouter = router({
  onNewMessage: userProcedure.input(
    z3.object({
      chatId: ObjectId3,
      lastMessageId: ObjectId3.nullish()
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
          yield tracked2(msg.id, msg);
        }
      }
    }
    for await (const [message] of on2(
      eventEmitter,
      `addMessageToChat:${chatId}`,
      {
        signal
      }
    )) {
      yield tracked2(message.id, message);
    }
  }),
  sendDirect: userProcedure.input(
    z3.object({
      sender: ObjectId3,
      receiver: ObjectId3,
      type: MessageType,
      content: z3.string().nullable(),
      imageUrl: z3.string().nullable()
    })
  ).mutation(async ({ input, ctx }) => {
    const { sender, receiver, content, imageUrl, type } = input;
    const { chat, isNewChat } = await findOrCreateDirectChat(
      ctx.prisma,
      sender,
      receiver
    );
    if (!chat) {
      throw new TRPCError5({
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
  sendTochat: userProcedure.input(SendMessageInput).query(async ({ input, ctx }) => {
    const { sender, chatId, content, imageUrl, type } = input;
    const chat = await ctx.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: true
      }
    });
    if (!chat) {
      throw new TRPCError5({
        code: "NOT_FOUND",
        message: "chat not found"
      });
    }
    if (!chat.participants.some((p) => p.id === sender)) {
      throw new TRPCError5({
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
import { TRPCError as TRPCError7 } from "@trpc/server";
import { z as z4 } from "@common";

// src/services/error.ts
import { TRPCError as TRPCError6 } from "@trpc/server";
function handleTRPCError(err, fallbackMessage = "An error occured", context) {
  if (err instanceof TRPCError6) {
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
  throw new TRPCError6({
    code: "INTERNAL_SERVER_ERROR",
    message: fallbackMessage
  });
}

// src/routers/user.ts
var userRouter = router({
  getUserById: userProcedure.input(z4.object({ userId: z4.string() })).query(async ({ input, ctx }) => {
    const { userId } = input;
    try {
      const user = getUserById(userId);
      return { user };
    } catch (err) {
      handleTRPCError(err, "Failed to retrieve user");
    }
  }),
  getUserByEmail: userProcedure.input(z4.object({ email: z4.string().email() })).query(async ({ input, ctx }) => {
    const user = await getUserByEmail(input.email);
    if (!user) {
      throw new TRPCError7({
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

// src/app.ts
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

// ../../packages/db/src/index.ts
var src_exports = {};
__export(src_exports, {
  prisma: () => prisma3
});
__reExport(src_exports, client_star);
import { PrismaClient } from "@prisma/client";
import * as client_star from "@prisma/client";
var prisma3 = new PrismaClient();

// src/app.ts
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import passport3 from "passport";

// src/middleware/auth.ts
import passport2 from "passport";
import { Strategy as LocalStrategy } from "passport-local";
passport2.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      const user = await getUserByEmail(email);
      console.log(email, user);
      if (!user)
        return done(null, false, {
          message: "Account with this email does not exist"
        });
      const validPassword = await verifyPassword(user, password);
      console.log("Password valid:", validPassword);
      if (!validPassword)
        return done(null, false, { message: "Incorrect password" });
      return done(null, user);
    }
  )
);
passport2.serializeUser((user, done) => done(null, user.id));
passport2.deserializeUser(async (id, done) => {
  const user = await getUserById(id);
  done(null, user || false);
});

// src/app.ts
dotenv.config();
var app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json());
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // ms
    },
    secret: "secret keyyy",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma3, {
      checkPeriod: 2 * 60 * 1e3,
      //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: void 0
    })
  })
);
app.use(passport3.initialize());
app.use(passport3.session());
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var PORT = Number(process.env.PORT) || 3001;
var server = app.listen(
  PORT,
  "0.0.0.0",
  () => console.log(`Express app listening on port ${PORT}!`)
);

// src/server/wsServer.ts
var wss = new WebSocketServer({ server });
var handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createWSSContext,
  // Enable heartbeat messages to keep connection open (disabled by default)
  keepAlive: {
    enabled: true,
    // server ping message interval in milliseconds
    pingMs: 3e4,
    // connection is terminated if pong message is not received in this many milliseconds
    pongWaitMs: 5e3
  }
});
wss.on("connection", (ws) => {
  console.log(`\u2795\u2795 Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`\u2796\u2796 Connection (${wss.clients.size})`);
  });
});
console.log("\u2705 WebSocket Server listening on ws://localhost:3001");
process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
//# sourceMappingURL=wsServer.mjs.map