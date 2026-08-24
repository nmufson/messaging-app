import type { UserWithOptionalProfile } from '@/trpc/context';
import { hashPassword } from '@/services/hash';
import { prisma, type Profile, type User } from '@repo/db';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export async function resetDatabase() {
  await prisma.friendRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatAction.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.session.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}

interface CreateMockRequestParams {
  user?: UserWithOptionalProfile;
  loginError?: Error | null;
  logoutError?: Error | null;
}

export function createMockRequest(params: CreateMockRequestParams = {}) {
  const { user, loginError = null, logoutError = null } = params;

  const request = {
    body: {},
    user,
    login: (_user: unknown, callback: (err?: Error | null) => void) => {
      callback(loginError);
    },
    logout: (callback: (err?: Error | null) => void) => {
      callback(logoutError);
    },
  } as unknown as Request;

  return request;
}

export function createMockResponse() {
  return {} as Response;
}

interface CreateCallerContextParams {
  user?: UserWithOptionalProfile;
  req?: Request;
}

export function createCallerContext(params: CreateCallerContextParams = {}) {
  const { user, req } = params;

  return {
    prisma,
    req: req ?? createMockRequest({ user }),
    res: createMockResponse(),
    user,
  };
}

interface SeedAuthUserParams {
  email?: string;
  password?: string;
  withProfile?: boolean;
  firstName?: string;
  lastName?: string;
}

interface SeedAuthUserResult {
  user: User;
  profile: Profile | null;
  contextUser: UserWithOptionalProfile;
  password: string;
}

export async function seedAuthUser(
  params: SeedAuthUserParams = {}
): Promise<SeedAuthUserResult> {
  const {
    email = `${randomUUID()}@example.com`,
    password = 'Password1!',
    withProfile = false,
    firstName = 'Test',
    lastName = 'User',
  } = params;

  const user = await prisma.user.create({
    data: {
      email,
      hashedPassword: await hashPassword(password),
    },
  });

  let profile = null;
  if (withProfile) {
    profile = await prisma.profile.create({
      data: {
        firstName,
        lastName,
        userId: user.id,
      },
    });
  }

  const contextUser: UserWithOptionalProfile = {
    ...user,
    profile: profile ? { id: profile.id } : null,
  };

  return {
    user,
    profile,
    contextUser,
    password,
  };
}
