import { ChatType, MessageType, UserRole } from '@prisma/client';

const PROFILE_PIC_URL = 'https://example.com/profile-pic.png';

export const usersData = [
  {
    id: 'user-alice',
    email: 'alice@example.com',
    hashedPassword: 'hashedpassword1',
    role: UserRole.USER,
  },
  {
    id: 'user-bob',
    email: 'bob@example.com',
    hashedPassword: 'hashedpassword2',
    role: UserRole.USER,
  },
  {
    id: 'user-charlie',
    email: 'charlie@example.com',
    hashedPassword: 'hashedpassword3',
    role: UserRole.USER,
  },
  {
    id: 'user-diana',
    email: 'diana@example.com',
    hashedPassword: 'hashedpassword4',
    role: UserRole.USER,
  },
];

export const profilesData = [
  {
    id: 'profile-alice',
    firstName: 'Alice',
    lastName: 'Smith',
    profilePictureUrl: PROFILE_PIC_URL,
    userId: 'user-alice',
  },
  {
    id: 'profile-bob',
    firstName: 'Bob',
    lastName: 'Jones',
    profilePictureUrl: PROFILE_PIC_URL,
    userId: 'user-bob',
  },
  {
    id: 'profile-charlie',
    firstName: 'Charlie',
    lastName: 'Brown',
    userId: 'user-charlie',
  },
  {
    id: 'profile-diana',
    firstName: 'Diana',
    lastName: 'Prince',
    userId: 'user-diana',
  },
];

export const chatsData = [
  {
    id: 'Ketchup Stains',
    creatorId: 'profile-alice',
    type: ChatType.DIRECT,
    participantIds: ['profile-alice', 'profile-bob'],
    groupPictureUrl: 'https://mdbcdn.b-cdn.net/img/new/avatars/2.webp',
  },
  {
    id: 'The Coolest Kats',
    creatorId: 'profile-charlie',
    type: ChatType.DIRECT,
    participantIds: ['profile-charlie', 'profile-diana'],
    groupPictureUrl: 'https://mdbcdn.b-cdn.net/img/new/avatars/2.webp',
  },
  {
    id: 'GROUP CHAT 1',
    creatorId: 'profile-charlie',
    type: ChatType.GROUP,
    participantIds: [
      'profile-charlie',
      'profile-diana',
      'profile-alice',
      'profile-bob',
    ],
    groupPictureUrl: 'https://mdbcdn.b-cdn.net/img/new/avatars/2.webp',
  },
  {
    id: 'biggroup2',
    creatorId: 'profile-charlie',
    type: ChatType.GROUP,
    participantIds: ['profile-charlie', 'profile-diana', 'profile-alice'],
  },
];

export const messagesData = [
  {
    id: 'msg-1',
    type: MessageType.TEXT,
    content: 'Hey Bob!',
    senderId: 'profile-alice',
    chatId: 'Ketchup Stains',
  },
  {
    id: 'msg-2',
    type: MessageType.TEXT,
    content: 'Hi Alice!',
    senderId: 'profile-bob',
    chatId: 'GROUP CHAT 1',
  },
  {
    id: 'msg-3',
    type: MessageType.TEXT,
    content: 'Hello Diana!',
    senderId: 'profile-charlie',
    chatId: 'biggroup2',
  },
];
