import { appRouter } from '@/trpc/router';
import { prisma } from '@repo/db';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import {
  createCallerContext,
  resetDatabase,
  seedAuthUser,
} from '../test/testUtils';

describe('action.updateInfo', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('normalizes whitespace-only chat names to null', async () => {
    const actor = await seedAuthUser({
      email: 'update-info-actor@example.com',
      withProfile: true,
      firstName: 'Actor',
      lastName: 'Name',
    });

    const chat = await prisma.chat.create({
      data: {
        creatorId: actor.profile!.id,
        type: 'GROUP',
        name: 'Old Name',
      },
    });

    await prisma.chatParticipant.create({
      data: {
        chatId: chat.id,
        profileId: actor.profile!.id,
      },
    });

    const caller = appRouter.createCaller(
      createCallerContext({ user: actor.contextUser })
    );

    const result = await caller.action.updateInfo({
      id: chat.id,
      name: '   ',
    });

    expect(result.updatedChat.name).toBeNull();
    expect(result.newActionActivity.actionType).toBe('NAME_CHANGED');
    expect(result.newActionActivity.content).toBeNull();
  });

  it('stores trimmed name in action content for NAME_CHANGED', async () => {
    const actor = await seedAuthUser({
      email: 'update-info-actor-2@example.com',
      withProfile: true,
      firstName: 'Actor',
      lastName: 'Name',
    });

    const chat = await prisma.chat.create({
      data: {
        creatorId: actor.profile!.id,
        type: 'GROUP',
        name: 'Old Name',
      },
    });

    await prisma.chatParticipant.create({
      data: {
        chatId: chat.id,
        profileId: actor.profile!.id,
      },
    });

    const caller = appRouter.createCaller(
      createCallerContext({ user: actor.contextUser })
    );

    const result = await caller.action.updateInfo({
      id: chat.id,
      name: '  New Group Name  ',
    });

    expect(result.updatedChat.name).toBe('New Group Name');
    expect(result.newActionActivity.actionType).toBe('NAME_CHANGED');
    expect(result.newActionActivity.content).toBe('New Group Name');
  });
});
