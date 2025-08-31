import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const usersData = {
  alice: { email: "alice@example.com", firstName: "Alice", lastName: "Smith", hashedPassword: "hashedpassword1" },
  bob: { email: "bob@example.com", firstName: "Bob", lastName: "Jones", hashedPassword: "hashedpassword2" },
  charlie: { email: "charlie@example.com", firstName: "Charlie", lastName: "Brown", hashedPassword: "hashedpassword3" },
  diana: { email: "diana@example.com", firstName: "Diana", lastName: "Prince", hashedPassword: "hashedpassword4" },
};
export const users = Object.values(usersData);

export const messages = [
  { content: "Hello world!", user: { connect: { email: usersData.alice.email } } },
  { content: "This is a test message", user: { connect: { email: usersData.bob.email } } },
  { content: "New user here! Excited to join.", user: { connect: { email: usersData.charlie.email } } },
  { content: "Welcome, Charlie!", user: { connect: { email: usersData.diana.email } } },
  { content: "Thanks, Diana!", user: { connect: { email: usersData.charlie.email } } },
];