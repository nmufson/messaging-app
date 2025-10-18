import { ChatType, MessageType, UserRole } from '@prisma/client';
import { randomUUID } from 'crypto';

const PROFILE_PIC_URL = 'https://mdbcdn.b-cdn.net/img/new/avatars/2.webp';

const userIds = {
  alice: randomUUID(),
  bob: randomUUID(),
  charlie: randomUUID(),
  diana: randomUUID(),
  nick: randomUUID(),
};

const profileIds = {
  alice: randomUUID(),
  bob: randomUUID(),
  charlie: randomUUID(),
  diana: randomUUID(),
  nick: randomUUID(),
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
    password: 'alicepw',
    role: UserRole.USER,
  },
  {
    id: userIds.bob,
    email: 'bob@example.com',
    password: 'bobpw',
    role: UserRole.USER,
  },
  {
    id: userIds.charlie,
    email: 'charlie@example.com',
    password: 'charliepw',
    role: UserRole.USER,
  },
  {
    id: userIds.diana,
    email: 'diana@example.com',
    password: 'dianapw',
    role: UserRole.USER,
  },
  {
    id: userIds.nick,
    email: 'email@gmail.com',
    password: 'fakePass1!',
    role: UserRole.ADMIN,
  },
];

export const profilesData = [
  {
    id: profileIds.alice,
    firstName: 'Alice',
    lastName: 'Smith',
    profilePictureUrl: PROFILE_PIC_URL,
    userId: userIds.alice,
    friends: [profileIds.bob, profileIds.charlie],
  },
  {
    id: profileIds.bob,
    firstName: 'Bob',
    lastName: 'Jones',
    profilePictureUrl: PROFILE_PIC_URL,
    userId: userIds.bob,
    friends: [profileIds.alice, profileIds.diana],
  },
  {
    id: profileIds.charlie,
    firstName: 'Charlie',
    lastName: 'Brown',
    profilePictureUrl: PROFILE_PIC_URL,
    userId: userIds.charlie,
    friends: [profileIds.alice, profileIds.diana],
  },
  {
    id: profileIds.diana,
    firstName: 'Diana',
    lastName: 'Prince',
    profilePictureUrl: PROFILE_PIC_URL,
    userId: userIds.diana,
    friends: [profileIds.bob, profileIds.charlie],
  },
  {
    id: profileIds.nick,
    firstName: 'Nick',
    lastName: 'Smith',
    profilePictureUrl: PROFILE_PIC_URL,
    userId: userIds.nick,
    friends: [profileIds.alice, profileIds.bob],
  },
];

export const chatsData = [
  {
    id: chatIds.ketchupStains,
    name: 'Ketchup Stains',
    creatorId: profileIds.alice,
    type: ChatType.DIRECT,
    participantIds: [profileIds.alice, profileIds.bob, profileIds.nick],
    groupPictureUrl: 'https://mdbcdn.b-cdn.net/img/new/avatars/2.webp',
  },
  {
    id: chatIds.coolestKats,
    name: 'The Coolest Kats',
    creatorId: profileIds.charlie,
    type: ChatType.DIRECT,
    participantIds: [profileIds.charlie, profileIds.diana, profileIds.nick],
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
      profileIds.nick,
    ],
    groupPictureUrl: 'https://mdbcdn.b-cdn.net/img/new/avatars/2.webp',
  },
  {
    id: chatIds.bigGroup2,
    name: 'Big Group 2',
    creatorId: profileIds.charlie,
    type: ChatType.GROUP,
    participantIds: [
      profileIds.charlie,
      profileIds.diana,
      profileIds.alice,
      profileIds.nick,
    ],
  },
];

export const messagesData = [
  // Ketchup Stains chat
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
    content: 'Hey Alice! How are you?',
    senderId: profileIds.bob,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Doing well, just had lunch.',
    senderId: profileIds.alice,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Nice! What did you eat?',
    senderId: profileIds.bob,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Sandwich with way too much ketchup.',
    senderId: profileIds.alice,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Classic Alice move 😂',
    senderId: profileIds.bob,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'You know me!',
    senderId: profileIds.alice,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Let’s hang out later?',
    senderId: profileIds.bob,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Sure! 5pm at the park?',
    senderId: profileIds.alice,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'See you there!',
    senderId: profileIds.bob,
    chatId: chatIds.ketchupStains,
  },

  // Coolest Kats chat
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Hey Diana, did you finish the project?',
    senderId: profileIds.charlie,
    chatId: chatIds.coolestKats,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Almost! Just need to add the final touches.',
    senderId: profileIds.diana,
    chatId: chatIds.coolestKats,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Let me know if you need help.',
    senderId: profileIds.charlie,
    chatId: chatIds.coolestKats,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Thanks, Charlie! You’re the best.',
    senderId: profileIds.diana,
    chatId: chatIds.coolestKats,
  },

  // Group Chat 1
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Hey everyone!',
    senderId: profileIds.charlie,
    chatId: chatIds.groupChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Hi Charlie!',
    senderId: profileIds.bob,
    chatId: chatIds.groupChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'What’s up?',
    senderId: profileIds.alice,
    chatId: chatIds.groupChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Ready for the game tonight?',
    senderId: profileIds.diana,
    chatId: chatIds.groupChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Absolutely! Go team!',
    senderId: profileIds.charlie,
    chatId: chatIds.groupChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Let’s win this!',
    senderId: profileIds.bob,
    chatId: chatIds.groupChat1,
  },

  // Big Group 2
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Morning all!',
    senderId: profileIds.diana,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Good morning!',
    senderId: profileIds.alice,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Anyone up for coffee?',
    senderId: profileIds.charlie,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Always!',
    senderId: profileIds.diana,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Count me in ☕',
    senderId: profileIds.alice,
    chatId: chatIds.bigGroup2,
  },

  // ...more messages for realism...
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Hello Diana!',
    senderId: profileIds.charlie,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'How was your weekend?',
    senderId: profileIds.diana,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Pretty good! Went hiking.',
    senderId: profileIds.alice,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Nice! Where to?',
    senderId: profileIds.charlie,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Bear Mountain.',
    senderId: profileIds.alice,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'That’s awesome!',
    senderId: profileIds.diana,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'We should all go next time.',
    senderId: profileIds.charlie,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'I’m in!',
    senderId: profileIds.alice,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Me too!',
    senderId: profileIds.diana,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'What’s everyone doing for lunch?',
    senderId: profileIds.charlie,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Ordering pizza.',
    senderId: profileIds.alice,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Save me a slice!',
    senderId: profileIds.diana,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Of course!',
    senderId: profileIds.alice,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Anyone want to play chess later?',
    senderId: profileIds.charlie,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'I’m game!',
    senderId: profileIds.diana,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'Let’s do it!',
    senderId: profileIds.alice,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    content: 'See you all soon!',
    senderId: profileIds.charlie,
    chatId: chatIds.bigGroup2,
  },
];
