import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import { createContext, publicProcedure, router } from './trpc';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router';
import passport from 'passport';
import './middleware/auth';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () =>
  console.log(`Express app listening on port ${PORT}!`)
);

export default app;
