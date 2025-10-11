import type { User } from '@repo/db';
import { hash, compare } from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(plainTextPassword: string) {
  return await hash(plainTextPassword, SALT_ROUNDS);
}

export async function verifyPassword(user: User, plainTextPassword: string) {
  const { hashedPassword } = user;
  return await compare(plainTextPassword, hashedPassword);
}
