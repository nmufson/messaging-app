import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';
import { router } from './trpc';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
