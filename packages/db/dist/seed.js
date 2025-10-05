"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sampleData_1 = require("./sampleData");
const index_1 = require("./index");
async function main() {
    console.log('Start seeding...');
    await index_1.prisma.message.deleteMany({});
    await index_1.prisma.chat.deleteMany({});
    await index_1.prisma.profile.deleteMany({});
    await index_1.prisma.user.deleteMany({});
    // 1️⃣ Create users
    for (const user of sampleData_1.usersData) {
        await index_1.prisma.user.create({ data: user });
    }
    console.log(sampleData_1.profilesData);
    // Create profiles
    for (const profile of sampleData_1.profilesData) {
        await index_1.prisma.profile.create({
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
    for (const chat of sampleData_1.chatsData) {
        await index_1.prisma.chat.create({
            data: {
                id: chat.id,
                creatorId: chat.creatorId,
                type: chat.type,
                participants: {
                    connect: chat.participantIds.map((id) => ({ id })),
                },
            },
        });
    }
    // Create messages
    for (const msg of sampleData_1.messagesData) {
        await index_1.prisma.message.create({
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
    await index_1.prisma.$disconnect();
});
