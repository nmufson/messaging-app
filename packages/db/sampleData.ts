import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const PROFILE_PIC_URL = 'https://example.com/profile-pic.png';

export const usersData = [
  {
    email: 'alice@example.com',
    hashedPassword: 'hashedpassword1',
    role: UserRole.USER,
  },
  {
    email: 'bob@example.com',
    hashedPassword: 'hashedpassword2',
    role: UserRole.USER,
  },
  {
    email: 'charlie@example.com',
    hashedPassword: 'hashedpassword3',
    role: UserRole.USER,
  },
  {
    email: 'diana@example.com',
    hashedPassword: 'hashedpassword4',
    role: UserRole.USER,
  },
];

export const profilesData = [
  { firstName: 'Alice', lastName: 'Smith', profilePictureUrl: PROFILE_PIC_URL },
  { firstName: 'Bob', lastName: 'Jones', profilePictureUrl: PROFILE_PIC_URL },
  { firstName: 'Charlie', lastName: 'Brown' },
  { firstName: 'Diana', lastName: 'Prince' },
];
