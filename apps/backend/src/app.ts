import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { prisma } from '@repo/db';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router';
import passport from 'passport';
import './middleware/auth';
import { createContext } from './trpc';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import { createWSSContext, authenticateWebSocketRequest } from './trpc/context';
import { connectionManager } from './lib/connectionManager';
import { randomUUID } from 'crypto';

interface TrpcLogParams {
  transport: 'http' | 'ws';
  path?: string;
  type: string;
  error: Error & { cause?: unknown };
}

function logTrpcError(params: TrpcLogParams): void {
  const { transport, path, type, error } = params;

  console.error(
    `[tRPC ${transport}] ${type} ${path ?? '<unknown>'}: ${error.message}`
  );

  const maybeCause = error.cause as { issues?: unknown } | undefined;
  if (maybeCause && Array.isArray(maybeCause.issues)) {
    console.error('[tRPC validation issues]', maybeCause.issues);
  }
}

dotenv.config();

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(express.json());

  app.use(
    session({
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // ms
      },
      secret: process.env.SECRET_KEY || 'default-secret',
      resave: false,
      saveUninitialized: false,
      store: new PrismaSessionStore(prisma, {
        checkPeriod: 2 * 60 * 1000, //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(
    '/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError({ error, path, type }) {
        logTrpcError({
          transport: 'http',
          path,
          type,
          error,
        });
      },
    })
  );

  return app;
}

const app = createApp();

const PORT = Number(process.env.PORT) || 3001;

export function startServer() {
  const server = app.listen(PORT, '0.0.0.0', () =>
    console.log(`Express app listening on port ${PORT}!`)
  );

  const wss = new WebSocketServer({ server });

  const handler = applyWSSHandler({
    wss,
    router: appRouter,
    createContext: createWSSContext,
    onError({ error, path, type }) {
      logTrpcError({
        transport: 'ws',
        path,
        type,
        error,
      });
    },
    // Enable heartbeat messages to keep connection open (disabled by default)
    keepAlive: {
      enabled: true,
      // server ping message interval in milliseconds
      pingMs: 30000,
      // connection is terminated if pong message is not received in this many milliseconds
      pongWaitMs: 5000,
    },
  });

  wss.on('connection', async (ws, req) => {
    console.log(`➕➕ Connection (${wss.clients.size})`);

    const connectionId = randomUUID();

    try {
      const user = await authenticateWebSocketRequest(req);
      const profileId = user?.profile?.id;

      if (profileId) {
        connectionManager.addConnection(connectionId, ws, profileId);
        console.log(
          `Profile ${profileId} connected with connection ${connectionId}`
        );
      } else {
        console.log('Anonymous connection (no authenticated user)');
      }
    } catch (error) {
      console.error('Error authenticating WebSocket connection:', error);
    }

    ws.once('close', () => {
      console.log(`➖➖ Connection (${wss.clients.size})`);
      // Connection cleanup handled by connectionManager
    });
  });

  console.log('✅ WebSocket Server listening on ws://localhost:3001');

  process.on('SIGTERM', () => {
    console.log('SIGTERM');
    handler.broadcastReconnectNotification();
    wss.close();
  });

  return { server, wss, handler };
}

const runtime = process.env.NODE_ENV === 'test' ? null : startServer();

export const server = runtime?.server;

export default app;
