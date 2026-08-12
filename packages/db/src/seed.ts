import {
  usersData,
  profilesData,
  chatsData,
  messagesData,
  friendRequestsData,
  chatActionsData,
} from './sampleData';
import { prisma } from './index';
import { hash } from 'bcrypt';

async function main() {
  console.log('🚨 Clearing existing data...');

  await prisma.friendRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatAction.deleteMany();
  await prisma.chatParticipant.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // 1️⃣ Create users
  for (const user of usersData) {
    const { password, ...userWithoutPassword } = user;
    const updatedUser = {
      ...userWithoutPassword,
      hashedPassword: await hash(password, 10),
    };
    await prisma.user.create({ data: updatedUser });
  }

  // Create profiles
  for (const profile of profilesData) {
    await prisma.profile.create({
      data: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        // headerUrl: profile.headerUrl,
        title: profile.title,
        bio: profile.bio,
        user: {
          connect: { id: profile.userId },
        },
      },
    });
  }

  // Add friends
  for (const profile of profilesData) {
    if (profile.friends && profile.friends.length > 0) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          friends: {
            connect: profile.friends.map((id) => ({ id })),
          },
        },
      });
    }
  }

  for (const request of friendRequestsData) {
    await prisma.friendRequest.create({
      data: {
        id: request.id,
        senderId: request.senderId,
        receiverId: request.receiverId,
        status: request.status,
      },
    });
  }

  // Create chats
  for (const chat of chatsData) {
    const createdChat = await prisma.chat.create({
      data: {
        id: chat.id,
        name: chat.name ?? null,
        creatorId: chat.creatorId,
        type: chat.type,
        groupPictureUrl: chat.groupPictureUrl,
        createdAt: chat.createdAt,
      },
    });

    if (chat.participantIds && chat.participantIds.length > 0) {
      await prisma.chatParticipant.createMany({
        data: chat.participantIds.map((profileId) => ({
          chatId: createdChat.id,
          profileId,
        })),
      });
    }
  }

  for (const action of chatActionsData) {
    await prisma.chatAction.create({
      data: {
        id: action.id,
        chatId: action.chatId,
        actionType: action.actionType,
        actorId: action.actorId,
        targetId: action.targetId,
        createdAt: action.createdAt,
      },
    });
  }

  // Create messages
  for (const msg of messagesData) {
    await prisma.message.create({
      data: {
        type: msg.type,
        content: msg.content || null,
        imageUrl: msg.imageUrl || null,
        senderId: msg.senderId,
        chatId: msg.chatId,
        createdAt: msg.createdAt,
      },
    });

    console.log('Seed data created!');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
