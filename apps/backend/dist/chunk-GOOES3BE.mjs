import {
  imageRouter
} from "./chunk-K5TNP3JA.mjs";
import {
  messageRouter
} from "./chunk-ZSPEUOH7.mjs";
import {
  userRouter
} from "./chunk-E4BYRLTS.mjs";
import {
  authRouter
} from "./chunk-CI634YR3.mjs";
import {
  chatRouter
} from "./chunk-MJRSHM6X.mjs";
import {
  friendRequestRouter
} from "./chunk-IFFFWPXF.mjs";
import {
  router
} from "./chunk-XI2LZ4T3.mjs";

// src/trpc/router.ts
var appRouter = router({
  auth: authRouter,
  user: userRouter,
  chat: chatRouter,
  friendRequest: friendRequestRouter,
  message: messageRouter,
  image: imageRouter
});

export {
  appRouter
};
