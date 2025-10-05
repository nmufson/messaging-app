import { User } from '@db';

declare function getUserByEmail(email: string): Promise<User | null>;
declare function getUserById(id: string): Promise<User | null>;

export { getUserByEmail, getUserById };
