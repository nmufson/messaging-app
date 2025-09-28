import type { User } from '@db';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(plainTextPassword: string) {
  return await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

export async function verifyPassword(user: User, plainTextPassword: string) {
  const { hashedPassword } = user;
  return await bcrypt.compare(plainTextPassword, hashedPassword);
}
