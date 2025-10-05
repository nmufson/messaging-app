// src/services/hash.ts
import { hash, compare } from "bcrypt";
var SALT_ROUNDS = 10;
async function hashPassword(plainTextPassword) {
  return await hash(plainTextPassword, SALT_ROUNDS);
}
async function verifyPassword(user, plainTextPassword) {
  const { hashedPassword } = user;
  return await compare(plainTextPassword, hashedPassword);
}

export {
  hashPassword,
  verifyPassword
};
