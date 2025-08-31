import { PrismaClient } from "@prisma/client";
import { users, messages } from "./sampleData";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding...`);

  console.log(`Deleting old records...`);

  await prisma.message.deleteMany();
  await prisma.user.deleteMany();

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  for (const message of messages) {
    await prisma.message.create({ data: message });
  }
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());