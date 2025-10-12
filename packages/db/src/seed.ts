import { usersData, profilesData, chatsData, messagesData } from './sampleData';
import { prisma } from './index';
import { hash } from 'bcrypt';

async function main() {
  console.log('🚨 Clearing existing data...');

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
        profilePictureUrl: profile.profilePictureUrl,
        user: {
          connect: { id: profile.userId },
        },
      },
    });
  }

  // Create chats
  for (const chat of chatsData) {
    await prisma.chat.create({
      data: {
        id: chat.id,
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
