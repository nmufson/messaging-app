import { usersData, profilesData, chatsData, messagesData } from './sampleData';
import { prisma } from './index';
import { hash } from 'bcrypt';

async function main() {
  console.log('🚨 Clearing existing data...');

  await prisma.friendRequest.deleteMany();
  await prisma.message.deleteMany();
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
  console.log(profilesData);
  // Create profiles
  for (const profile of profilesData) {
    await prisma.profile.create({
      data: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
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

  // Create chats
  for (const chat of chatsData) {
    await prisma.chat.create({
      data: {
        id: chat.id,
        name: chat.name ?? null,
        creatorId: chat.creatorId,
        type: chat.type,
        groupPictureUrl: chat.groupPictureUrl,
        participants: {
          connect: chat.participantIds.map((id) => ({ id })),
        },
      },
    });
  }

  // Create messages
  for (const msg of messagesData) {
    await prisma.message.create({
      data: {
        type: msg.type,
        content: msg.content,
        senderId: msg.senderId,
        chatId: msg.chatId,
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
