"use strict";
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/services/chat.ts
var chat_exports = {};
__export(chat_exports, {
  findOrCreateDirectChat: () => findOrCreateDirectChat
});
module.exports = __toCommonJS(chat_exports);
var import_chat = require("@common/schemas/chat");
var findOrCreateDirectChat = async (prisma, senderId, receiverId) => {
  const existingChat = await prisma.chat.findFirst({
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
  const newChat = await prisma.chat.create({
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  findOrCreateDirectChat
});
//# sourceMappingURL=chat.js.map