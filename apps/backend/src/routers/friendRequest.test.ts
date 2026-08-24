import { appRouter } from '@/trpc/router';
import { TRPCError } from '@trpc/server';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@repo/db';
import {
  createCallerContext,
  resetDatabase,
  seedAuthUser,
} from '../test/testUtils';

describe('friendRequestRouter', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rejects sending a friend request to yourself', async () => {
    const sender = await seedAuthUser({ withProfile: true });
    const caller = appRouter.createCaller(
      createCallerContext({ user: sender.contextUser })
    );

    await expect(
      caller.friendRequest.sendRequest({ receiverId: sender.profile!.id })
    ).rejects.toMatchObject<Partial<TRPCError>>({
      code: 'BAD_REQUEST',
      message: 'You cannot send a friend request to yourself.',
    });
  });

  it('creates a pending friend request', async () => {
    const { profile: senderProfile, contextUser: senderContextUser } =
      await seedAuthUser({
        withProfile: true,
        firstName: 'Alice',
        lastName: 'Smith',
      });
    const { profile: receiverProfile } = await seedAuthUser({
      withProfile: true,
      firstName: 'Bob',
      lastName: 'Johnson',
    });

    const caller = appRouter.createCaller(
      createCallerContext({ user: senderContextUser })
    );

    const result = await caller.friendRequest.sendRequest({
      receiverId: receiverProfile.id,
    });

    expect(result.status).toBe('PENDING');

    const request = await prisma.friendRequest.findUnique({
      where: { id: result.id },
    });

    expect(request).toMatchObject({
      senderId: senderProfile.id,
      receiverId: receiverProfile.id,
      status: 'PENDING',
    });
  });

  it('accepts a pending request and creates friendships on each profile', async () => {
    const sender = await seedAuthUser({ withProfile: true });
    const receiver = await seedAuthUser({ withProfile: true });

    const senderCaller = appRouter.createCaller(
      createCallerContext({ user: sender.contextUser })
    );

    await senderCaller.friendRequest.sendRequest({
      receiverId: receiver.profile!.id,
    });

    const receiverCaller = appRouter.createCaller(
      createCallerContext({ user: receiver.contextUser })
    );

    const result = await receiverCaller.friendRequest.respondToIncoming({
      senderId: sender.profile!.id,
      newStatus: 'ACCEPTED',
    });

    const populatedReceiver = await prisma.profile.findUnique({
      where: { id: receiver.profile!.id },
      include: { friends: true },
    });
    const populatedSender = await prisma.profile.findUnique({
      where: { id: sender.profile!.id },
      include: { friends: true },
    });

    expect(result.status).toBe('ACCEPTED');
    expect(populatedReceiver?.friends.map((friend) => friend.id)).toContain(
      sender.profile!.id
    );
    expect(populatedSender?.friends.map((friend) => friend.id)).toContain(
      receiver.profile!.id
    );
  });

  it('declines a pending request', async () => {
    const sender = await seedAuthUser({ withProfile: true });
    const receiver = await seedAuthUser({ withProfile: true });

    const senderCaller = appRouter.createCaller(
      createCallerContext({ user: sender.contextUser })
    );

    await senderCaller.friendRequest.sendRequest({
      receiverId: receiver.profile!.id,
    });

    const receiverCaller = appRouter.createCaller(
      createCallerContext({ user: receiver.contextUser })
    );

    const result = await receiverCaller.friendRequest.respondToIncoming({
      senderId: sender.profile!.id,
      newStatus: 'DECLINED',
    });

    const populatedReceiver = await prisma.profile.findUnique({
      where: { id: receiver.profile!.id },
      include: { friends: true },
    });

    expect(result.status).toBe('DECLINED');
    expect(populatedReceiver?.friends).toHaveLength(0);
  });
});
