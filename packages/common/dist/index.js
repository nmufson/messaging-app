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
  AuthProfileDTO: () => AuthProfileDTO,
  AuthUserDTO: () => AuthUserDTO,
  ChatDTO: () => ChatDTO,
  ChatDetailDTO: () => ChatDetailDTO,
  ChatType: () => ChatType,
  CreateProfileInput: () => CreateProfileInput,
  DateTimeSchema: () => DateTimeSchema,
  FriendRequestStatus: () => FriendRequestStatus,
  LogInInput: () => LogInInput,
  MessageDTO: () => MessageDTO,
  MessageType: () => MessageType,
  ObjectId: () => ObjectId,
  ProfileDTO: () => ProfileDTO,
  RegisterInput: () => RegisterInput,
  SendMessageInput: () => SendMessageInput,
  UpdateProfileInput: () => UpdateProfileInput,
  UserRole: () => UserRole,
  mergeAsyncIterators: () => mergeAsyncIterators,
  superjson: () => superjson_default,
  z: () => import_zod7.z
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
var stringToDateTime = import_zod.z.string().transform((str) => import_luxon.DateTime.fromISO(str));
var DateTimeSchema = import_zod.z.union([dateTime, dateToDateTime, stringToDateTime]).pipe(dateTime);

// src/schemas/message.ts
var import_zod2 = require("zod");
var MessageType = import_zod2.z.enum(["TEXT", "IMAGE"]);
var SendMessageInput = import_zod2.z.object({
  type: MessageType,
  content: import_zod2.z.string().nullable(),
  imageUrl: import_zod2.z.string().nullable(),
  sender: ObjectId,
  chatId: ObjectId
});
var MessageDTO = import_zod2.z.object({
  id: ObjectId,
  type: MessageType,
  content: import_zod2.z.string().nullable(),
  imageUrl: import_zod2.z.string().nullable(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  senderId: ObjectId
});

// src/schemas/chat.ts
var import_zod3 = __toESM(require("zod"));
var ChatType = import_zod3.default.enum(["GROUP", "DIRECT"]);
var ChatDTO = import_zod3.default.object({
  id: ObjectId,
  type: ChatType,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  participants: import_zod3.default.array(
    import_zod3.default.object({
      id: ObjectId,
      firstName: import_zod3.default.string(),
      lastName: import_zod3.default.string(),
      profilePictureUrl: import_zod3.default.string().nullable()
    })
  ),
  messages: MessageDTO.array(),
  // Group-specific fields
  name: import_zod3.default.string().nullable(),
  groupPictureUrl: import_zod3.default.string().nullable(),
  creatorId: ObjectId
});
var ChatDetailDTO = ChatDTO.extend({});

// src/schemas/profile.ts
var import_zod4 = require("zod");
var CreateProfileInput = import_zod4.z.object({
  userId: ObjectId,
  firstName: import_zod4.z.string(),
  lastName: import_zod4.z.string(),
  profilePictureUrl: import_zod4.z.string().optional()
});
var UpdateProfileInput = import_zod4.z.object({
  profileId: ObjectId,
  firstName: import_zod4.z.string().optional(),
  lastName: import_zod4.z.string().optional(),
  profilePictureUrl: import_zod4.z.string().optional()
});
var ProfileDTO = import_zod4.z.object({
  id: ObjectId,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  firstName: import_zod4.z.string(),
  lastName: import_zod4.z.string(),
  profilePictureUrl: import_zod4.z.string().nullable()
});

// src/schemas/friendRequest.ts
var import_zod5 = require("zod");
var FriendRequestStatus = import_zod5.z.enum([
  "PENDING",
  "CANCELLED",
  "DECLINED",
  "ACCEPTED"
]);

// src/schemas/auth.ts
var import_zod6 = require("zod");
var Password = import_zod6.z.string().min(8, "Password must be at least 8 characters long").refine((password) => /[A-Z]/.test(password), {
  message: "Password must contain at least one uppercase letter"
}).refine((password) => /[a-z]/.test(password), {
  message: "Password must contain at least one lowercase letter"
}).refine((password) => /[0-9]/.test(password), {
  message: "Password must contain at least one number"
}).refine((password) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password), {
  message: "Password must contain at least one special character"
});
var RegisterInput = import_zod6.z.object({
  email: import_zod6.z.email(),
  password: Password,
  confirmPassword: Password
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
var LogInInput = import_zod6.z.object({
  email: import_zod6.z.email(),
  password: import_zod6.z.string()
});
var UserRole = import_zod6.z.enum(["USER", "ADMIN"]);
var AuthProfileDTO = import_zod6.z.object({
  id: ObjectId,
  firstName: import_zod6.z.string().min(1).max(100),
  lastName: import_zod6.z.string().min(1).max(100),
  profilePictureUrl: import_zod6.z.string().url().nullable()
});
var AuthUserDTO = import_zod6.z.object({
  id: ObjectId,
  email: import_zod6.z.string().email(),
  role: UserRole,
  profile: AuthProfileDTO
});

// src/index.ts
var import_zod7 = require("zod");

// src/superjson.ts
var import_superjson = __toESM(require("superjson"));
var import_luxon2 = require("luxon");
import_superjson.default.registerCustom(
  {
    isApplicable: (v) => import_luxon2.DateTime.isDateTime(v),
    serialize: (v) => {
      const iso = v.toISO();
      if (!iso) throw new Error("Cannot serialize invalid Luxon DateTime");
      return iso;
    },
    deserialize: (v) => import_luxon2.DateTime.fromISO(v)
  },
  "luxon-DateTime"
);
var superjson_default = import_superjson.default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthProfileDTO,
  AuthUserDTO,
  ChatDTO,
  ChatDetailDTO,
  ChatType,
  CreateProfileInput,
  DateTimeSchema,
  FriendRequestStatus,
  LogInInput,
  MessageDTO,
  MessageType,
  ObjectId,
  ProfileDTO,
  RegisterInput,
  SendMessageInput,
  UpdateProfileInput,
  UserRole,
  mergeAsyncIterators,
  superjson,
  z
});
//# sourceMappingURL=index.js.map