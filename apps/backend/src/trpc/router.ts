import { authRouter } from '../routers/auth';
import { chatRouter } from '../routers/chat';
import { friendRequestRouter } from '../routers/friendRequest';
import { imageRouter } from '../routers/image';
import { messageRouter } from '../routers/message';
import { userRouter } from '../routers/user';
import { router } from '.';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,

  conversation: chatRouter,
  friendRequest: friendRequestRouter,
  message: messageRouter,

  image: imageRouter,
});

export type AppRouter = typeof appRouter;
