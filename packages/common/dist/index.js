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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ChatDTO: () => ChatDTO,
  ChatDetailDTO: () => ChatDetailDTO,
  ChatType: () => ChatType,
  DateTimeSchema: () => DateTimeSchema,
  MessageDTO: () => MessageDTO,
  MessageType: () => MessageType,
  ObjectId: () => ObjectId,
  SendMessageInput: () => SendMessageInput,
  UserRole: () => UserRole,
  mergeAsyncIterators: () => mergeAsyncIterators,
  superjson: () => import_superjson.default,
  z: () => import_zod5.z
});
module.exports = __toCommonJS(index_exports);

// src/utils/mergeAsyncIterators.ts
async function* mergeAsyncIterators(iterables) {
  const readers = iterables.map((it) => it[Symbol.asyncIterator]());
  const nexts = readers.map((r, i) => r.next().then((res) => ({ i, res })));
  for (; ; ) {
    const { i, res } = await Promise.race(nexts);
    if (res.done) {
      return;
    }
    yield res.value;
    nexts[i] = readers[i].next().then((res2) => ({ i, res: res2 }));
  }
}

// src/schemas/primitives.ts
var import_luxon = require("luxon");
var import_zod = require("zod");
var ObjectId = import_zod.z.uuid();
var dateTime = import_zod.z.custom(import_luxon.DateTime.isDateTime, {
  params: { name: "DateTime" }
});
var dateToDateTime = import_zod.z.date().transform((date) => import_luxon.DateTime.fromJSDate(date));
var DateTimeSchema = import_zod.z.union([dateTime, dateToDateTime]).pipe(dateTime);

// src/schemas/user.ts
var import_zod2 = __toESM(require("zod"));
var UserRole = import_zod2.default.enum(["USER", "ADMIN"]);

// src/schemas/message.ts
var import_zod3 = require("zod");
var MessageType = import_zod3.z.enum(["TEXT", "IMAGE"]);
var SendMessageInput = import_zod3.z.object({
  type: MessageType,
  content: import_zod3.z.string().nullable(),
  imageUrl: import_zod3.z.string().nullable(),
  sender: ObjectId,
  chatId: ObjectId
});

// src/schemas/chat.ts
var import_zod4 = __toESM(require("zod"));
var ChatType = import_zod4.default.enum(["GROUP", "DIRECT"]);
var MessageDTO = import_zod4.default.object({
  id: ObjectId,
  type: MessageType,
  content: import_zod4.default.string().nullable(),
  imageUrl: import_zod4.default.string().nullable(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  senderId: ObjectId
});
var ChatDTO = import_zod4.default.object({
  id: ObjectId,
  type: ChatType,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  participants: import_zod4.default.array(
    import_zod4.default.object({
      id: ObjectId,
      firstName: import_zod4.default.string(),
      lastName: import_zod4.default.string(),
      profilePictureUrl: import_zod4.default.string().nullable()
    })
  ),
  messages: MessageDTO.array(),
  // Group-specific fields
  name: import_zod4.default.string().nullable(),
  groupPictureUrl: import_zod4.default.string().nullable(),
  creatorId: ObjectId
});
var ChatDetailDTO = ChatDTO.extend({});

// src/index.ts
var import_zod5 = require("zod");
var import_superjson = __toESM(require("superjson"));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChatDTO,
  ChatDetailDTO,
  ChatType,
  DateTimeSchema,
  MessageDTO,
  MessageType,
  ObjectId,
  SendMessageInput,
  UserRole,
  mergeAsyncIterators,
  superjson,
  z
});
//# sourceMappingURL=index.js.map