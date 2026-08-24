import { appRouter } from '@/trpc/router';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@repo/db';
import {
  createCallerContext,
  resetDatabase,
  seedAuthUser,
} from '../test/testUtils';

describe('chatParticipant lifecycle', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a chat participant when a member is added to chat', async () => {
    const actor = await seedAuthUser({
      email: 'actor@example.com',
      withProfile: true,
      firstName: 'Actor',
      lastName: 'A',
    });
    const target = await seedAuthUser({
      email: 'target@example.com',
      withProfile: true,
      firstName: 'Target',
      lastName: 'B',
    });

    const chat = await prisma.chat.create({
      data: {
        creatorId: actor.profile!.id,
        type: 'DIRECT',
      },
    });

    await prisma.chatParticipant.createMany({
      data: [{ chatId: chat.id, profileId: actor.profile!.id }],
    });

    const caller = appRouter.createCaller(
      createCallerContext({ user: actor.contextUser })
    );

    const result = await caller.action.addMember({
      chatId: chat.id,
      profileId: target.profile!.id,
    });

    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_profileId: {
          chatId: chat.id,
          profileId: target.profile!.id,
        },
      },
    });

    expect(result.newActionActivity.activityType).toBe('action');
    expect(result.newActionActivity.actionType).toBe('MEMBER_ADDED');
    expect(participant).not.toBeNull();
    expect(participant?.chatId).toBe(chat.id);
    expect(participant?.profileId).toBe(target.profile!.id);

    const updatedChat = await prisma.chat.findUnique({
      where: { id: chat.id },
    });

    expect(updatedChat?.lastActivityAt).not.toBeNull();
  });

  it('removes a chat participant and generates removal action', async () => {
    const actor = await seedAuthUser({
      email: 'remove-actor@example.com',
      withProfile: true,
      firstName: 'Remove',
      lastName: 'Actor',
    });
    const target = await seedAuthUser({
      email: 'remove-target@example.com',
      withProfile: true,
      firstName: 'Remove',
      lastName: 'Target',
    });

    const chat = await prisma.chat.create({
      data: {
        creatorId: actor.profile!.id,
        type: 'DIRECT',
      },
    });

    await prisma.chatParticipant.createMany({
      data: [
        { chatId: chat.id, profileId: actor.profile!.id },
        { chatId: chat.id, profileId: target.profile!.id },
      ],
    });

    const caller = appRouter.createCaller(
      createCallerContext({ user: actor.contextUser })
    );

    const result = await caller.action.removeMember({
      chatId: chat.id,
      profileId: target.profile!.id,
    });

    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_profileId: {
          chatId: chat.id,
          profileId: target.profile!.id,
        },
      },
    });

    expect(result.newActionActivity.activityType).toBe('action');
    expect(result.newActionActivity.actionType).toBe('MEMBER_REMOVED');
    expect(participant).toBeNull();

    const updatedChat = await prisma.chat.findUnique({
      where: { id: chat.id },
    });

    expect(updatedChat?.lastActivityAt).not.toBeNull();
  });
});
