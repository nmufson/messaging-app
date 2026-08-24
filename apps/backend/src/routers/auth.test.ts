import { appRouter } from '@/trpc/router';
import { TRPCError } from '@trpc/server';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@repo/db';
import {
  createCallerContext,
  resetDatabase,
  seedAuthUser,
} from '../test/testUtils';

describe('authRouter', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('registers a new user', async () => {
    const caller = appRouter.createCaller(createCallerContext());

    const result = await caller.auth.register({
      email: 'new-user@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });

    const createdUser = await prisma.user.findUnique({
      where: { email: 'new-user@example.com' },
    });

    expect(result.email).toBe('new-user@example.com');
    expect(result.profile).toBeNull();
    expect(createdUser).not.toBeNull();
    expect(createdUser?.hashedPassword).not.toBe('Password1!');
  });

  it('rejects duplicate email registration', async () => {
    await seedAuthUser({ email: 'taken@example.com' });
    const caller = appRouter.createCaller(createCallerContext());

    await expect(
      caller.auth.register({
        email: 'taken@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      })
    ).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'CONFLICT',
      message: 'Email already in use',
    });
  });

  it('logs in an existing user and returns their profile via me', async () => {
    const seededUser = await seedAuthUser({
      email: 'login@example.com',
      withProfile: true,
      firstName: 'Ava',
      lastName: 'Stone',
    });

    const caller = appRouter.createCaller(
      createCallerContext({ user: seededUser.contextUser })
    );

    const result = await caller.auth.me();

    expect(result?.email).toBe(seededUser.user.email);
    expect(result?.profile).toMatchObject({
      id: seededUser.profile?.id,
      firstName: 'Ava',
      lastName: 'Stone',
    });
  });

  it('returns the current authenticated user from me', async () => {
    const seededUser = await seedAuthUser({
      email: 'me@example.com',
      withProfile: true,
    });

    const caller = appRouter.createCaller(
      createCallerContext({ user: seededUser.contextUser })
    );

    const result = await caller.auth.me();

    expect(result).toMatchObject({
      email: seededUser.user.email,
      profile: { id: seededUser.profile?.id },
    });
  });
});
