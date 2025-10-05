import { User } from '@db';

declare function hashPassword(plainTextPassword: string): Promise<string>;
declare function verifyPassword(user: User, plainTextPassword: string): Promise<boolean>;

export { hashPassword, verifyPassword };
