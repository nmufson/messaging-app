// src/routers/message.ts
import { ObjectId } from "@common/schemas/primitives";
import { MessageType, SendMessageInput } from "@common/schemas/message";
import { tracked, TRPCError as TRPCError2 } from "@trpc/server";
import { z } from "@common";

// src/services/chat.ts
import { ChatType } from "@common/schemas/chat";
var findOrCreateDirectChat = async (prisma2, senderId, receiverId) => {
  const existingChat = await prisma2.chat.findFirst({
    where: {
      type: ChatType.enum.DIRECT,
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
import { prisma } from "@db";

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

// src/routers/message.ts
import { on } from "events";

// src/lib/eventBus.ts
import EventEmitter from "events";
var eventEmitter = new EventEmitter();

// src/routers/message.ts
var messageRouter = router({
  onNewMessage: userProcedure.input(
    z.object({
      chatId: ObjectId,
      lastMessageId: ObjectId.nullish()
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
          yield tracked(msg.id, msg);
        }
      }
    }
    for await (const [message] of on(
      eventEmitter,
      `addMessageToChat:${chatId}`,
      {
        signal
      }
    )) {
      yield tracked(message.id, message);
    }
  }),
  sendDirect: userProcedure.input(
    z.object({
      sender: ObjectId,
      receiver: ObjectId,
      type: MessageType,
      content: z.string().nullable(),
      imageUrl: z.string().nullable()
    })
  ).mutation(async ({ input, ctx }) => {
    const { sender, receiver, content, imageUrl, type } = input;
    const { chat, isNewChat } = await findOrCreateDirectChat(
      ctx.prisma,
      sender,
      receiver
    );
    if (!chat) {
      throw new TRPCError2({
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
      throw new TRPCError2({
        code: "NOT_FOUND",
        message: "chat not found"
      });
    }
    if (!chat.participants.some((p) => p.id === sender)) {
      throw new TRPCError2({
        code: "FORBIDDEN",
        message: "User is not a participant in this chat"
      });
    }
    const newMessage = await sendMessage(ctx.prisma, input);
    eventEmitter.emit(`addMessageToChat:${chatId}`, newMessage);
    return { newMessage };
  })
});
export {
  messageRouter
};
//# sourceMappingURL=message.mjs.map