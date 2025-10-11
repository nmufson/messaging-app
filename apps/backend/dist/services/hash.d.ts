import type { User } from '@repo/db';
export declare function hashPassword(plainTextPassword: string): Promise<string>;
export declare function verifyPassword(user: User, plainTextPassword: string): Promise<boolean>;
