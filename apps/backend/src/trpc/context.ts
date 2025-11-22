import type { Profile, User } from '@repo/db';
import { parse as parseCookie } from 'cookie';
import { Request, Response } from 'express';
import { prisma } from '@repo/db';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import type { IncomingMessage } from 'http';
import { CreateWSSContextFnOptions } from '@trpc/server/adapters/ws';
import { ObjectId } from '@repo/common';

// TODO: take this from env?
const SESSION_COOKIE_NAME = 'connect.sid'; // default for express-session
const SESSION_SECRET = 'secret keyyy'; // must match your express-session secret

export type UserWithProfile = User & { profile: { id: ObjectId } | null };

export async function authenticateWebSocketRequest(
  req: IncomingMessage
): Promise<UserWithProfile | null> {
  let user: User | null = null;

  try {
    const cookies = parseCookie(req.headers.cookie || '');
    const sessionIdRaw = cookies[SESSION_COOKIE_NAME];

    if (sessionIdRaw) {
      // Unsigned session ID (remove 's:' prefix if present)
      const sessionId = sessionIdRaw.startsWith('s:')
        ? require('cookie-signature').unsign(
            sessionIdRaw.slice(2),
            SESSION_SECRET
          )
        : sessionIdRaw;

      if (sessionId) {
        const session = await prisma.session.findUnique({
          where: { id: sessionId },
        });

        if (session && session.data) {
          // Parse session data and get userId
          const sessionData = JSON.parse(session.data);
          const userId = sessionData.passport?.user;
          if (userId) {
            const userWithProfile = await prisma.user.findUnique({
              where: { id: userId },
              include: { profile: { select: { id: true } } },
            });

            user = userWithProfile;
          }
        }
      }
    }
  } catch (err) {
    console.error('WS auth error:', err);
  }

  return user as UserWithProfile;
}

interface BaseContext {
  user?: UserWithProfile;
  prisma: typeof prisma;
}

// Express
interface HTTPContext extends BaseContext {
  req: Request;
  res: Response;
}

interface WSContext extends BaseContext {
  req: IncomingMessage;
}

export type Context = HTTPContext | WSContext;

export function createContext({
  req,
  res,
}: CreateExpressContextOptions): HTTPContext {
  return {
    req,
    res,
    user: req.user as UserWithProfile,
    prisma,
  };
}

export async function createWSSContext({
  req,
}: CreateWSSContextFnOptions): Promise<WSContext> {
  const user = await authenticateWebSocketRequest(req);

  return {
    req,
    user: user || undefined,
    prisma,
  };
}
