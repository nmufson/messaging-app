import { ChatType, MessageType, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';

const PROFILE_PIC_URL = 'https://example.com/profile-pic.png';

const userIds = {
  alice: randomUUID(),
  bob: randomUUID(),
  charlie: randomUUID(),
  diana: randomUUID(),
};

const profileIds = {
  alice: randomUUID(),
  bob: randomUUID(),
  charlie: randomUUID(),
  diana: randomUUID(),
};

const chatIds = {
  ketchupStains: randomUUID(),
  coolestKats: randomUUID(),
  groupChat1: randomUUID(),
  bigGroup2: randomUUID(),
};
export const usersData = [
  {
    id: userIds.alice,
    email: 'alice@example.com',
    hashedPassword: 'hashedpassword1',
    role: UserRole.USER,
  },
  {
    id: userIds.bob,
    email: 'bob@example.com',
    hashedPassword: 'hashedpassword2',
    role: UserRole.USER,
  },
  {
    id: userIds.charlie,
    email: 'charlie@example.com',
    hashedPassword: 'hashedpassword3',
    role: UserRole.USER,
  },
  {
    id: userIds.diana,
    email: 'diana@example.com',
    hashedPassword: 'hashedpassword4',
    role: UserRole.USER,
  },
];

export const profilesData = [
  {
    id: profileIds.alice,
    firstName: 'Alice',
    lastName: 'Smith',
    profilePictureUrl: PROFILE_PIC_URL,
    userId: userIds.alice,
  },
  {
    id: profileIds.bob,
    firstName: 'Bob',
    lastName: 'Jones',
    profilePictureUrl: PROFILE_PIC_URL,
    userId: userIds.bob,
  },
  {
    id: profileIds.charlie,
    firstName: 'Charlie',
    lastName: 'Brown',
    profilePictureUrl: PROFILE_PIC_URL,
    userId: userIds.charlie,
  },
  {
    id: profileIds.diana,
    firstName: 'Diana',
    lastName: 'Prince',
    profilePictureUrl: PROFILE_PIC_URL,
    userId: userIds.diana,
  },
];

export const chatsData = [
  {
    id: chatIds.ketchupStains,
    name: 'Ketchup Stains',
    creatorId: profileIds.alice,
    type: ChatType.DIRECT,
    participantIds: [profileIds.alice, profileIds.bob],
    groupPictureUrl: 'https://mdbcdn.b-cdn.net/img/new/avatars/2.webp',
  },
  {
    id: chatIds.coolestKats,
    name: 'The Coolest Kats',
    creatorId: profileIds.charlie,
    type: ChatType.DIRECT,
    participantIds: [profileIds.charlie, profileIds.diana],
    groupPictureUrl: 'https://mdbcdn.b-cdn.net/img/new/avatars/2.webp',
  },
  {
    id: chatIds.groupChat1,
    name: 'GROUP CHAT 1',
    creatorId: profileIds.charlie,
    type: ChatType.GROUP,
    participantIds: [
      profileIds.charlie,
      profileIds.diana,
      profileIds.alice,
      profileIds.bob,
    ],
    groupPictureUrl: 'https://mdbcdn.b-cdn.net/img/new/avatars/2.webp',
  },
  {
    id: chatIds.bigGroup2,
    name: 'Big Group 2',
    creatorId: profileIds.charlie,
    type: ChatType.GROUP,
    participantIds: [profileIds.charlie, profileIds.diana, profileIds.alice],
  },
];

export const messagesData = [
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Hey Bob!',
    senderId: profileIds.alice,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Hi Alice!',
    senderId: profileIds.bob,
    chatId: chatIds.groupChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Hello Diana!',
    senderId: profileIds.charlie,
    chatId: chatIds.bigGroup2,
  },
];
