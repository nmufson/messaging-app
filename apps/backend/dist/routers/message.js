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

// src/routers/message.ts
var message_exports = {};
__export(message_exports, {
  messageRouter: () => messageRouter
});
module.exports = __toCommonJS(message_exports);
var import_primitives = require("@common/schemas/primitives");
var import_message = require("@common/schemas/message");
var import_server3 = require("@trpc/server");
var import_common2 = require("@common");

// src/services/chat.ts
var import_chat = require("@common/schemas/chat");
var findOrCreateDirectChat = async (prisma2, senderId, receiverId) => {
  const existingChat = await prisma2.chat.findFirst({
    where: {
      type: import_chat.ChatType.enum.DIRECT,
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
  const newChat = await prisma2.chat.create({
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
var sendMessage = async (prisma2, params) => {
  const { chatId, sender, type, content, imageUrl } = params;
  return await prisma2.message.create({
    data: {
      type,
      content,
      imageUrl,
      sender: { connect: { id: sender } },
      chat: { connect: { id: chatId } }
    }
  });
};

// src/trpc/context.ts
var import_db = require("@db");

// src/trpc/init.ts
var import_server = require("@trpc/server");
var import_common = require("@common");
var t = import_server.initTRPC.context().create({
  transformer: import_common.superjson
});
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

// src/routers/message.ts
var import_events2 = require("events");

// src/lib/eventBus.ts
var import_events = __toESM(require("events"));
var eventEmitter = new import_events.default();

// src/routers/message.ts
var messageRouter = router({
  onNewMessage: userProcedure.input(
    import_common2.z.object({
      chatId: import_primitives.ObjectId,
      lastMessageId: import_primitives.ObjectId.nullish()
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
          yield (0, import_server3.tracked)(msg.id, msg);
        }
      }
    }
    for await (const [message] of (0, import_events2.on)(
      eventEmitter,
      `addMessageToChat:${chatId}`,
      {
        signal
      }
    )) {
      yield (0, import_server3.tracked)(message.id, message);
    }
  }),
  sendDirect: userProcedure.input(
    import_common2.z.object({
      sender: import_primitives.ObjectId,
      receiver: import_primitives.ObjectId,
      type: import_message.MessageType,
      content: import_common2.z.string().nullable(),
      imageUrl: import_common2.z.string().nullable()
    })
  ).mutation(async ({ input, ctx }) => {
    const { sender, receiver, content, imageUrl, type } = input;
    const { chat, isNewChat } = await findOrCreateDirectChat(
      ctx.prisma,
      sender,
      receiver
    );
    if (!chat) {
      throw new import_server3.TRPCError({
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
      throw new import_server3.TRPCError({
        code: "NOT_FOUND",
        message: "chat not found"
      });
    }
    if (!chat.participants.some((p) => p.id === sender)) {
      throw new import_server3.TRPCError({
        code: "FORBIDDEN",
        message: "User is not a participant in this chat"
      });
    }
    const newMessage = await sendMessage(ctx.prisma, input);
    eventEmitter.emit(`addMessageToChat:${chatId}`, newMessage);
    return { newMessage };
  })
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  messageRouter
});
//# sourceMappingURL=message.js.map