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

// src/schemas/user.ts
import z2 from "zod";
var UserRole = z2.enum(["USER", "ADMIN"]);

// src/schemas/message.ts
import { z as z3 } from "zod";
var MessageType = z3.enum(["TEXT", "IMAGE"]);
var SendMessageInput = z3.object({
  type: MessageType,
  content: z3.string().nullable(),
  imageUrl: z3.string().nullable(),
  sender: ObjectId,
  chatId: ObjectId
});
var MessageDTO = z3.object({
  id: ObjectId,
  type: MessageType,
  content: z3.string().nullable(),
  imageUrl: z3.string().nullable(),
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  senderId: ObjectId
});

// src/schemas/chat.ts
import z4 from "zod";
var ChatType = z4.enum(["GROUP", "DIRECT"]);
var ChatDTO = z4.object({
  id: ObjectId,
  type: ChatType,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema.nullable(),
  participants: z4.array(
    z4.object({
      id: ObjectId,
      firstName: z4.string(),
      lastName: z4.string(),
      profilePictureUrl: z4.string().nullable()
    })
  ),
  messages: MessageDTO.array(),
  // Group-specific fields
  name: z4.string().nullable(),
  groupPictureUrl: z4.string().nullable(),
  creatorId: ObjectId
});
var ChatDetailDTO = ChatDTO.extend({});

// src/index.ts
import { z as z5 } from "zod";
import superjson from "superjson";
export {
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
  z5 as z
};
//# sourceMappingURL=index.mjs.map