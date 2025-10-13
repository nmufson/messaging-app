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
import { DateTime } from "luxon";
import { z } from "zod";
var ObjectId = z.uuid();
var dateTime = z.custom(DateTime.isDateTime, {
  params: { name: "DateTime" }
});
var dateToDateTime = z.date().transform((date) => DateTime.fromJSDate(date));
var stringToDateTime = z.string().transform((str) => DateTime.fromISO(str));
var DateTimeSchema = z.union([dateTime, dateToDateTime, stringToDateTime]).pipe(dateTime);

// src/schemas/message.ts
import { z as z2 } from "zod";
var MessageType = z2.enum(["TEXT", "IMAGE"]);
var SendMessageInput = z2.object({
  type: MessageType,
  content: z2.string().nullable(),
  imageUrl: z2.string().nullable(),
  sender: ObjectId,
  chatId: ObjectId
});
var MessageDTO = z2.object({
  id: ObjectId,
  type: MessageType,
  content: z2.string().nullable(),
  imageUrl: z2.string().nullable(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  senderId: ObjectId
});

// src/schemas/chat.ts
import z3 from "zod";
var ChatType = z3.enum(["GROUP", "DIRECT"]);
var ChatDTO = z3.object({
  id: ObjectId,
  type: ChatType,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  participants: z3.array(
    z3.object({
      id: ObjectId,
      firstName: z3.string(),
      lastName: z3.string(),
      profilePictureUrl: z3.string().nullable()
    })
  ),
  messages: MessageDTO.array(),
  // Group-specific fields
  name: z3.string().nullable(),
  groupPictureUrl: z3.string().nullable(),
  creatorId: ObjectId
});
var ChatDetailDTO = ChatDTO.extend({});

// src/schemas/profile.ts
import { z as z4 } from "zod";
var CreateProfileInput = z4.object({
  userId: ObjectId,
  firstName: z4.string(),
  lastName: z4.string(),
  profilePictureUrl: z4.string().optional()
});
var UpdateProfileInput = z4.object({
  profileId: ObjectId,
  firstName: z4.string().optional(),
  lastName: z4.string().optional(),
  profilePictureUrl: z4.string().optional()
});
var ProfileDTO = z4.object({
  id: ObjectId,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  firstName: z4.string(),
  lastName: z4.string(),
  profilePictureUrl: z4.string().nullable()
});

// src/schemas/friendRequest.ts
import { z as z5 } from "zod";
var FriendRequestStatus = z5.enum([
  "PENDING",
  "CANCELLED",
  "DECLINED",
  "ACCEPTED"
]);

// src/schemas/auth.ts
import { z as z6 } from "zod";
var Password = z6.string().min(8, "Password must be at least 8 characters long").refine((password) => /[A-Z]/.test(password), {
  message: "Password must contain at least one uppercase letter"
}).refine((password) => /[a-z]/.test(password), {
  message: "Password must contain at least one lowercase letter"
}).refine((password) => /[0-9]/.test(password), {
  message: "Password must contain at least one number"
}).refine((password) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password), {
  message: "Password must contain at least one special character"
});
var RegisterInput = z6.object({
  email: z6.email(),
  password: Password,
  confirmPassword: Password
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
var LogInInput = z6.object({
  email: z6.email(),
  password: z6.string()
});
var UserRole = z6.enum(["USER", "ADMIN"]);
var AuthProfileDTO = z6.object({
  id: ObjectId,
  firstName: z6.string().min(1).max(100),
  lastName: z6.string().min(1).max(100),
  profilePictureUrl: z6.string().url().nullable()
});
var AuthUserDTO = z6.object({
  id: ObjectId,
  email: z6.string().email(),
  role: UserRole,
  profile: AuthProfileDTO
});

// src/index.ts
import { z as z7 } from "zod";

// src/superjson.ts
import superjson from "superjson";
import { DateTime as DateTime2 } from "luxon";
superjson.registerCustom(
  {
    isApplicable: (v) => DateTime2.isDateTime(v),
    serialize: (v) => {
      const iso = v.toISO();
      if (!iso) throw new Error("Cannot serialize invalid Luxon DateTime");
      return iso;
    },
    deserialize: (v) => DateTime2.fromISO(v)
  },
  "luxon-DateTime"
);
var superjson_default = superjson;
export {
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
  superjson_default as superjson,
  z7 as z
};
//# sourceMappingURL=index.mjs.map