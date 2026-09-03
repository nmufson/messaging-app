import { createAction } from '@/services/action';
import { sendMessage } from '@/services/message';
import { prisma } from '@repo/db';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDatabase, seedAuthUser } from '../test/testUtils';

describe('activity creation and chat updates', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('creates a message activity and increments unread counts for other chat participants', async () => {
    const sender = await seedAuthUser({
      email: 'sender@example.com',
      withProfile: true,
      firstName: 'Alice',
      lastName: 'Smith',
    });
    const recipient = await seedAuthUser({
      email: 'recipient@example.com',
      withProfile: true,
      firstName: 'LeBron',
      lastName: 'James',
    });

    const chat = await prisma.chat.create({
      data: {
        creatorId: sender.profile!.id,
        type: 'DIRECT',
      },
    });

    await prisma.chatParticipant.createMany({
      data: [
        { chatId: chat.id, profileId: sender.profile!.id },
        { chatId: chat.id, profileId: recipient.profile!.id },
      ],
    });

    const messageActivity = await sendMessage(prisma, {
      chatId: chat.id,
      message: {
        senderId: sender.profile!.id,
        type: 'TEXT',
        content: 'hello there',
        imageUrl: null,
      },
    });

    const updatedChat = await prisma.chat.findUnique({
      where: { id: chat.id },
    });

    const participants = await prisma.chatParticipant.findMany({
      where: { chatId: chat.id },
      orderBy: { profileId: 'asc' },
    });

    expect(messageActivity.activityType).toBe('message');
    expect(messageActivity.content).toBe('hello there');
    expect(messageActivity.chatId).toBe(chat.id);
    expect(updatedChat?.lastActivityAt.getTime()).toBeGreaterThan(0);

    expect(
      participants.find(
        (participant) => participant.profileId === sender.profile!.id
      )?.unreadActivities
    ).toBe(0);
    expect(
      participants.find(
        (participant) => participant.profileId === recipient.profile!.id
      )?.unreadActivities
    ).toBe(1);
  });

  it('creates an action activity and updates the chat activity timestamp', async () => {
    const actor = await seedAuthUser({
      email: 'actor-activity@example.com',
      withProfile: true,
      firstName: 'Actor',
      lastName: 'Activity',
    });
    const target = await seedAuthUser({
      email: 'target-activity@example.com',
      withProfile: true,
      firstName: 'Target',
      lastName: 'Activity',
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

    const { newActionActivity } = await createAction(prisma, {
      chatId: chat.id,
      actionType: 'NAME_CHANGED',
      content: 'The Cool New Chat Name',
      actorId: actor.profile!.id,
      targetId: target.profile!.id,
    });

    const participants = await prisma.chatParticipant.findMany({
      where: { chatId: chat.id },
      orderBy: { profileId: 'asc' },
    });
    const updatedChat = await prisma.chat.findUnique({
      where: { id: chat.id },
    });

    expect(newActionActivity.activityType).toBe('action');
    expect(newActionActivity.actionType).toBe('NAME_CHANGED');
    expect(newActionActivity.content).toBe('The Cool New Chat Name');
    expect(newActionActivity.actor.id).toBe(actor.profile!.id);
    expect(newActionActivity.target?.id).toBe(target.profile!.id);
    expect(updatedChat?.lastActivityAt).not.toBeNull();

    expect(
      participants.find(
        (participant) => participant.profileId === actor.profile!.id
      )?.unreadActivities
    ).toBe(0);
    expect(
      participants.find(
        (participant) => participant.profileId === target.profile!.id
      )?.unreadActivities
    ).toBe(1);
  });
});
