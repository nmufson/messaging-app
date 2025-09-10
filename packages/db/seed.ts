import { PrismaClient } from '@prisma/client';
import { usersData, profilesData } from './sampleData';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1️⃣ Create users
  const createdUsers = [];
  for (let i = 0; i < usersData.length; i++) {
    const user = await prisma.user.create({
      data: usersData[i],
    });
    createdUsers.push(user);
  }

  // 2️⃣ Create profiles linked to users
  for (let i = 0; i < createdUsers.length; i++) {
    await prisma.profile.create({
      data: {
        ...profilesData[i],
        userId: createdUsers[i].id, // link profile to user
      },
    });
  }

  console.log('Seed data created!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
