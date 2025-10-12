import { authRouter } from '../routers/auth';
import { chatRouter } from '../routers/chat';
import { friendRequestRouter } from '../routers/friendRequest';
import { imageRouter } from '../routers/image';
import { messageRouter } from '../routers/message';
import { userRouter } from '../routers/user';
import { router } from '.';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,

  chat: chatRouter,
  friendRequest: friendRequestRouter,
  message: messageRouter,

  image: imageRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
