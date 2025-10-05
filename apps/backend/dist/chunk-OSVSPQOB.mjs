// src/services/user.ts
import { prisma } from "@db";
async function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}
async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

export {
  getUserByEmail,
  getUserById
};
