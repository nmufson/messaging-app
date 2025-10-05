import {
  prisma,
  src_exports
} from "./chunk-4QVFQIOJ.mjs";

// src/services/user.ts
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
