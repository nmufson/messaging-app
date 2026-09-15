import {
  ChatActionType,
  ChatType,
  MessageType,
  UserRole,
} from '@prisma/client';
import { randomUUID } from 'crypto';

const SEED_ASSET_BASE_PATH = '/seed';

function seedAssetPath(params: string[]): string {
  return `${SEED_ASSET_BASE_PATH}/${params.join('/')}`;
}

const SEED_ASSETS = {
  avatars: {
    avatar0: seedAssetPath(['avatars', 'avatar-0.jpeg']),
    avatar1: seedAssetPath(['avatars', 'avatar-1.avif']),
    avatar3: seedAssetPath(['avatars', 'avatar-3.avif']),
    portrait: seedAssetPath([
      'avatars',
      '360_F_1274137375_hetXwsOEVXNlvvkfeQ0Uv1M08isDihw0.jpg',
    ]),
    cartoon: seedAssetPath([
      'avatars',
      '3d-cartoon-style-character_23-2151033973.avif',
    ]),
    sideProfile: seedAssetPath([
      'avatars',
      'hand-drawn-side-profile-cartoon-illustration_23-2150503821.avif',
    ]),
    alt1: seedAssetPath(['avatars', 'images(1).jpeg']),
    alt2: seedAssetPath(['avatars', 'images(2).jpeg']),
    alt3: seedAssetPath(['avatars', 'images.jpeg']),
  },
  headers: {
    cooking: seedAssetPath(['headers', 'images.jpeg']),
    hiking: seedAssetPath(['headers', 'images(1).jpeg']),
    running: seedAssetPath(['headers', 'images(2).jpeg']),
    general: seedAssetPath(['headers', 'images(3).jpeg']),
    abstract: seedAssetPath([
      'headers',
      'awesome-cool-art-banner-background-v_1522721jpg!bw700.jpeg',
    ]),
  },
  photoMessages: {
    cooking: [
      seedAssetPath(['photo-messages', 'cooking0.jpg']),
      seedAssetPath(['photo-messages', 'cooking1.jpg']),
      seedAssetPath(['photo-messages', 'cookin2.jpg']),
    ],
    hiking: [
      seedAssetPath(['photo-messages', 'hiking0.jpg']),
      seedAssetPath(['photo-messages', 'hiking1.jpg']),
      seedAssetPath(['photo-messages', 'hiking2.jpg']),
    ],
    running: [
      seedAssetPath(['photo-messages', 'running0.jpeg']),
      seedAssetPath(['photo-messages', 'running1.jpg']),
    ],
  },
  groupChatPhotos: {
    cooking: seedAssetPath(['group-chat-photos', 'cooking-group.jpg']),
    hiking: seedAssetPath(['group-chat-photos', 'hiking-group.jpg']),
    running: seedAssetPath(['group-chat-photos', 'running-group.jpg']),
    teamHands: seedAssetPath([
      'group-chat-photos',
      'istockphoto-1368965646-612x612.jpg',
    ]),
    social: seedAssetPath([
      'group-chat-photos',
      '360_F_569818893_ph01fzGNwgIBf0pzcwyJ3IwsRzQTpmpN.jpg',
    ]),
  },
} as const;

const BASE_DATE = new Date('2026-09-15T12:00:00Z');

function getRandomDateBetween(startDate: Date, endDate: Date): Date {
  const timeSpan = endDate.getTime() - startDate.getTime();
  const randomOffset = Math.random() * timeSpan;
  return new Date(startDate.getTime() + randomOffset);
}

const userIds = {
  alice: randomUUID(),
  bob: randomUUID(),
  charlie: randomUUID(),
  diana: randomUUID(),
  nick: randomUUID(),
  emma: randomUUID(),
  oliver: randomUUID(),
  sophia: randomUUID(),
  liam: randomUUID(),
  ava: randomUUID(),
  mia: randomUUID(),
  noah: randomUUID(),
  lucas: randomUUID(),
  elijah: randomUUID(),
  grace: randomUUID(),
  harper: randomUUID(),
};

const profileIds = {
  alice: randomUUID(),
  bob: randomUUID(),
  charlie: randomUUID(),
  diana: randomUUID(),
  nick: randomUUID(),
  emma: randomUUID(),
  oliver: randomUUID(),
  sophia: randomUUID(),
  liam: randomUUID(),
  ava: randomUUID(),
  mia: randomUUID(),
  noah: randomUUID(),
  lucas: randomUUID(),
  elijah: randomUUID(),
  grace: randomUUID(),
  harper: randomUUID(),
};

type ProfileSeedKey = keyof typeof profileIds;
type ProfileMedia = { avatarUrl?: string; headerUrl?: string };
interface ProfileSeed extends ProfileMedia {
  id: string;
  firstName: string;
  lastName: string;
  userId: string;
  friends: string[];
  title?: string;
  bio?: string;
}

const PROFILE_MEDIA_BY_KEY: Partial<Record<ProfileSeedKey, ProfileMedia>> = {
  bob: {
    avatarUrl: SEED_ASSETS.avatars.avatar0,
    headerUrl: SEED_ASSETS.headers.cooking,
  },
  alice: {
    avatarUrl: SEED_ASSETS.avatars.avatar1,
  },
  charlie: {
    avatarUrl: SEED_ASSETS.avatars.sideProfile,
    headerUrl: SEED_ASSETS.headers.hiking,
  },
  diana: {
    avatarUrl: SEED_ASSETS.avatars.portrait,
    headerUrl: SEED_ASSETS.headers.running,
  },
  nick: {
    headerUrl: SEED_ASSETS.headers.general,
  },
  emma: {
    avatarUrl: SEED_ASSETS.avatars.cartoon,
    headerUrl: SEED_ASSETS.headers.abstract,
  },
  sophia: {
    avatarUrl: SEED_ASSETS.avatars.alt1,
  },
  liam: {
    avatarUrl: SEED_ASSETS.avatars.avatar3,
  },
  harper: {
    avatarUrl: SEED_ASSETS.avatars.alt3,
  },
};

function getProfileMedia(profileKey: ProfileSeedKey): ProfileMedia {
  return PROFILE_MEDIA_BY_KEY[profileKey] ?? {};
}

const friendRequestIds = {
  request1: randomUUID(),
  request2: randomUUID(),
  request3: randomUUID(),
  request4: randomUUID(),
  request5: randomUUID(),
};

const chatIds = {
  ketchupStains: randomUUID(),
  coolestKats: randomUUID(),
  groupChat1: randomUUID(),
  bigGroup2: randomUUID(),
  directChat1: randomUUID(),
  directChat2: randomUUID(),
};

const chatCreationDates = {
  [chatIds.ketchupStains]: new Date('2026-08-24T18:30:00Z'),
  [chatIds.coolestKats]: new Date('2026-08-26T16:00:00Z'),
  [chatIds.groupChat1]: new Date('2026-08-29T12:45:00Z'),
  [chatIds.bigGroup2]: new Date('2026-09-01T19:20:00Z'),
  [chatIds.directChat1]: new Date('2026-09-10T15:00:00Z'),
  [chatIds.directChat2]: new Date('2026-09-11T14:00:00Z'),
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
  {
    id: userIds.emma,
    email: 'emma@example.com',
    password: 'emmapw',
    role: UserRole.USER,
  },
  {
    id: userIds.oliver,
    email: 'oliver@example.com',
    password: 'oliverpw',
    role: UserRole.USER,
  },
  {
    id: userIds.sophia,
    email: 'sophia@example.com',
    password: 'sophiapw',
    role: UserRole.USER,
  },
  {
    id: userIds.liam,
    email: 'liam@example.com',
    password: 'liampw',
    role: UserRole.USER,
  },
  {
    id: userIds.ava,
    email: 'ava@example.com',
    password: 'avapw',
    role: UserRole.USER,
  },
  {
    id: userIds.mia,
    email: 'mia@example.com',
    password: 'miapw',
    role: UserRole.USER,
  },
  {
    id: userIds.noah,
    email: 'noah@example.com',
    password: 'noahpw',
    role: UserRole.USER,
  },
  {
    id: userIds.lucas,
    email: 'lucas@example.com',
    password: 'lucaspw',
    role: UserRole.USER,
  },
  {
    id: userIds.elijah,
    email: 'elijah@example.com',
    password: 'elijahpw',
    role: UserRole.USER,
  },
  {
    id: userIds.grace,
    email: 'grace@example.com',
    password: 'gracepw',
    role: UserRole.USER,
  },
  {
    id: userIds.harper,
    email: 'harper@example.com',
    password: 'harperpw',
    role: UserRole.USER,
  },
];

export const profilesData: ProfileSeed[] = [
  {
    id: profileIds.alice,
    firstName: 'Alice',
    lastName: 'Smith',
    ...getProfileMedia('alice'),
    userId: userIds.alice,
    friends: [profileIds.bob, profileIds.charlie, profileIds.nick],
    title: 'Software Engineer',
    bio: 'Passionate about building scalable web applications and exploring new technologies.',
  },
  {
    id: profileIds.bob,
    firstName: 'Bob',
    lastName: 'Jones',
    ...getProfileMedia('bob'),
    userId: userIds.bob,
    friends: [profileIds.alice, profileIds.diana, profileIds.nick],
  },
  {
    id: profileIds.charlie,
    firstName: 'Charlie',
    lastName: 'Brown',
    ...getProfileMedia('charlie'),
    userId: userIds.charlie,
    friends: [profileIds.alice, profileIds.diana],
  },
  {
    id: profileIds.diana,
    firstName: 'Diana',
    lastName: 'Prince',
    ...getProfileMedia('diana'),
    userId: userIds.diana,
    friends: [profileIds.bob, profileIds.charlie],
  },
  {
    id: profileIds.nick,
    firstName: 'Nick',
    lastName: 'Mufson',
    ...getProfileMedia('nick'),
    userId: userIds.nick,
    friends: [
      profileIds.alice,
      profileIds.bob,
      profileIds.emma,
      profileIds.oliver,
      profileIds.sophia,
      profileIds.liam,
      profileIds.ava,
      profileIds.mia,
      profileIds.noah,
      profileIds.lucas,
    ],
  },
  {
    id: profileIds.emma,
    firstName: 'Emma',
    lastName: 'Johnson',
    ...getProfileMedia('emma'),
    userId: userIds.emma,
    friends: [profileIds.nick],
    title: 'UI/UX Designer',
    bio: 'Designing intuitive user experiences with a keen eye for detail.',
  },
  {
    id: profileIds.oliver,
    firstName: 'Oliver',
    lastName: 'Williams',
    userId: userIds.oliver,
    friends: [profileIds.nick],
    title: 'DevOps Engineer',
    bio: 'Ensuring smooth deployments and maintaining infrastructure reliability.',
  },
  {
    id: profileIds.sophia,
    firstName: 'Sophia',
    lastName: 'Martinez',
    ...getProfileMedia('sophia'),
    userId: userIds.sophia,
    friends: [profileIds.nick],
    title: 'Data Scientist',
    bio: 'Turning data into actionable insights to drive business decisions.',
  },
  {
    id: profileIds.liam,
    firstName: 'Liam',
    lastName: 'Davis',
    ...getProfileMedia('liam'),
    userId: userIds.liam,
    friends: [profileIds.nick],
  },
  {
    id: profileIds.ava,
    firstName: 'Ava',
    lastName: 'Garcia',
    userId: userIds.ava,
    friends: [profileIds.nick],
  },
  {
    id: profileIds.mia,
    firstName: 'Mia',
    lastName: 'Rodriguez',
    userId: userIds.mia,
    friends: [profileIds.nick],
  },
  {
    id: profileIds.noah,
    firstName: 'Noah',
    lastName: 'Lee',
    userId: userIds.noah,
    friends: [profileIds.nick],
  },
  {
    id: profileIds.lucas,
    firstName: 'Lucas',
    lastName: 'Walker',
    userId: userIds.lucas,
    friends: [profileIds.nick],
  },
  {
    id: profileIds.elijah,
    firstName: 'Elijah',
    lastName: 'Hall',
    userId: userIds.elijah,
    friends: [],
  },
  {
    id: profileIds.grace,
    firstName: 'Grace',
    lastName: 'Allen',
    userId: userIds.grace,
    friends: [],
  },
  {
    id: profileIds.harper,
    firstName: 'Harper',
    lastName: 'Young',
    ...getProfileMedia('harper'),
    userId: userIds.harper,
    friends: [],
  },
];

export const friendRequestsData = [
  {
    id: friendRequestIds.request1,
    senderId: profileIds.charlie,
    receiverId: profileIds.nick,
    status: 'PENDING' as const,
  },
  {
    id: friendRequestIds.request2,
    senderId: profileIds.diana,
    receiverId: profileIds.nick,
    status: 'PENDING' as const,
  },
  {
    id: friendRequestIds.request3,
    senderId: profileIds.elijah,
    receiverId: profileIds.nick,
    status: 'PENDING' as const,
  },
  {
    id: friendRequestIds.request4,
    senderId: profileIds.grace,
    receiverId: profileIds.nick,
    status: 'PENDING' as const,
  },
  {
    id: friendRequestIds.request5,
    senderId: profileIds.harper,
    receiverId: profileIds.nick,
    status: 'ACCEPTED' as const,
  },
];

const rawChatsData = [
  {
    id: chatIds.ketchupStains,
    name: 'Kitchen Crew',
    creatorId: profileIds.alice,
    type: ChatType.GROUP,
    participantIds: [profileIds.alice, profileIds.bob, profileIds.nick],
    groupPictureUrl: SEED_ASSETS.groupChatPhotos.cooking,
  },
  {
    id: chatIds.coolestKats,
    name: 'Weekend Hikers',
    creatorId: profileIds.charlie,
    type: ChatType.GROUP,
    participantIds: [profileIds.charlie, profileIds.diana, profileIds.nick],
    groupPictureUrl: SEED_ASSETS.groupChatPhotos.hiking,
  },
  {
    id: chatIds.groupChat1,
    name: 'Sunrise Runners',
    creatorId: profileIds.charlie,
    type: ChatType.GROUP,
    participantIds: [
      profileIds.charlie,
      profileIds.diana,
      profileIds.alice,
      profileIds.bob,
      profileIds.nick,
    ],
    groupPictureUrl: SEED_ASSETS.groupChatPhotos.running,
  },
  {
    id: chatIds.bigGroup2,
    name: 'General Hangout',
    creatorId: profileIds.charlie,
    type: ChatType.GROUP,
    participantIds: [
      profileIds.charlie,
      profileIds.diana,
      profileIds.alice,
      profileIds.nick,
      profileIds.bob,
    ],
    groupPictureUrl: SEED_ASSETS.groupChatPhotos.teamHands,
  },
  {
    id: chatIds.directChat1,
    creatorId: profileIds.nick,
    type: ChatType.DIRECT,
    participantIds: [profileIds.alice, profileIds.nick],
    groupPictureUrl: SEED_ASSETS.groupChatPhotos.social,
  },
  {
    id: chatIds.directChat2,
    creatorId: profileIds.nick,
    type: ChatType.DIRECT,
    participantIds: [profileIds.emma, profileIds.nick],
    groupPictureUrl: SEED_ASSETS.headers.abstract,
  },
];

const rawMessagesData = [
  // Direct chats
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-12T15:20:00Z',
    content: 'Hey Nick, did the lasagna photos upload on your end?',
    senderId: profileIds.alice,
    chatId: chatIds.directChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-12T15:30:00Z',
    content: 'Yep, they are looking great in the app preview.',
    senderId: profileIds.nick,
    chatId: chatIds.directChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-13T15:30:00Z',
    content:
      'Hey Emma, can you share your latest design notes for the profile flow?',
    senderId: profileIds.nick,
    chatId: chatIds.directChat2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-13T15:37:00Z',
    content: 'Absolutely, I will send them tonight.',
    senderId: profileIds.emma,
    chatId: chatIds.directChat2,
  },

  // Cooking chat
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-14T17:10:00Z',
    content: 'Kitchen Crew recipe night starts at 7, who is cooking what?',
    senderId: profileIds.alice,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-14T17:14:00Z',
    content: 'I will handle pasta and garlic bread.',
    senderId: profileIds.bob,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.IMAGE,
    createdAt: '2026-09-14T17:18:00Z',
    imageUrl: SEED_ASSETS.photoMessages.cooking[0],
    senderId: profileIds.alice,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-14T17:23:00Z',
    content: 'That plating looks clean. Save me a portion please.',
    senderId: profileIds.nick,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.IMAGE,
    createdAt: '2026-09-14T17:30:00Z',
    imageUrl: SEED_ASSETS.photoMessages.cooking[1],
    senderId: profileIds.bob,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-14T17:37:00Z',
    content: 'Perfect. I am trying this with a spicier sauce next week.',
    senderId: profileIds.alice,
    chatId: chatIds.ketchupStains,
  },
  {
    id: randomUUID(),
    type: MessageType.IMAGE,
    createdAt: '2026-09-14T17:42:00Z',
    imageUrl: SEED_ASSETS.photoMessages.cooking[2],
    senderId: profileIds.nick,
    chatId: chatIds.ketchupStains,
  },

  // Hiking chat
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-11T07:50:00Z',
    content: 'Weekend Hikers, weather looks perfect for Saturday.',
    senderId: profileIds.charlie,
    chatId: chatIds.coolestKats,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-11T07:55:00Z',
    content: 'Lets do the ridge trail and start early.',
    senderId: profileIds.diana,
    chatId: chatIds.coolestKats,
  },
  {
    id: randomUUID(),
    type: MessageType.IMAGE,
    createdAt: '2026-09-11T08:02:00Z',
    imageUrl: SEED_ASSETS.photoMessages.hiking[0],
    senderId: profileIds.charlie,
    chatId: chatIds.coolestKats,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-11T08:08:00Z',
    content: 'Trailhead parking was full by 8 last time.',
    senderId: profileIds.nick,
    chatId: chatIds.coolestKats,
  },
  {
    id: randomUUID(),
    type: MessageType.IMAGE,
    createdAt: '2026-09-11T08:15:00Z',
    imageUrl: SEED_ASSETS.photoMessages.hiking[1],
    senderId: profileIds.diana,
    chatId: chatIds.coolestKats,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-11T08:22:00Z',
    content: 'Lets bring extra water, that climb is no joke.',
    senderId: profileIds.charlie,
    chatId: chatIds.coolestKats,
  },
  {
    id: randomUUID(),
    type: MessageType.IMAGE,
    createdAt: '2026-09-11T08:30:00Z',
    imageUrl: SEED_ASSETS.photoMessages.hiking[2],
    senderId: profileIds.nick,
    chatId: chatIds.coolestKats,
  },

  // Running chat
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-09T06:10:00Z',
    content: 'Sunrise Runners check-in: easy 5k or interval session tomorrow?',
    senderId: profileIds.charlie,
    chatId: chatIds.groupChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-09T06:16:00Z',
    content: 'I vote intervals. I am trying to improve pace this month.',
    senderId: profileIds.alice,
    chatId: chatIds.groupChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.IMAGE,
    createdAt: '2026-09-09T06:24:00Z',
    imageUrl: SEED_ASSETS.photoMessages.running[0],
    senderId: profileIds.diana,
    chatId: chatIds.groupChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-09T06:31:00Z',
    content: 'Meet at the track at 6:30 and warm up for 10 minutes.',
    senderId: profileIds.bob,
    chatId: chatIds.groupChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.IMAGE,
    createdAt: '2026-09-09T06:39:00Z',
    imageUrl: SEED_ASSETS.photoMessages.running[1],
    senderId: profileIds.charlie,
    chatId: chatIds.groupChat1,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-09T06:45:00Z',
    content: 'Deal. I will post splits after we finish.',
    senderId: profileIds.nick,
    chatId: chatIds.groupChat1,
  },

  // General chat
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-15T18:05:00Z',
    content: 'General Hangout: game night or movie night this Friday?',
    senderId: profileIds.diana,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-15T18:12:00Z',
    content: 'Game night. I will bring snacks.',
    senderId: profileIds.alice,
    chatId: chatIds.bigGroup2,
  },
  {
    id: randomUUID(),
    type: MessageType.TEXT,
    createdAt: '2026-09-15T18:18:00Z',
    content: 'Perfect, I can host this time.',
    senderId: profileIds.charlie,
    chatId: chatIds.bigGroup2,
  },
];

export const messagesData = rawMessagesData.map((msg) => ({
  ...msg,
  createdAt: new Date(msg.createdAt),
}));

const latestMessageDateByChat = messagesData.reduce<
  Partial<Record<string, Date>>
>((acc, message) => {
  const currentLatest = acc[message.chatId];
  if (!currentLatest || message.createdAt > currentLatest) {
    acc[message.chatId] = message.createdAt;
  }
  return acc;
}, {});

export const chatsData = rawChatsData.map((chat) => ({
  ...chat,
  createdAt: chatCreationDates[chat.id],
  lastActivityAt:
    latestMessageDateByChat[chat.id] ?? chatCreationDates[chat.id],
}));

const chatActionIds = {
  ketchupStainsCreated: randomUUID(),
  coolestKatsCreated: randomUUID(),
  groupChat1Created: randomUUID(),
  bigGroup2Created: randomUUID(),
};

const rawChatActionsData = [
  {
    id: chatActionIds.ketchupStainsCreated,
    chatId: chatIds.ketchupStains,
    actionType: ChatActionType.CHAT_CREATED,
    actorId: profileIds.alice,
    targetId: null,
  },
  {
    id: chatActionIds.coolestKatsCreated,
    chatId: chatIds.coolestKats,
    actionType: ChatActionType.CHAT_CREATED,
    actorId: profileIds.charlie,
    targetId: null,
  },
  {
    id: chatActionIds.groupChat1Created,
    chatId: chatIds.groupChat1,
    actionType: ChatActionType.CHAT_CREATED,
    actorId: profileIds.charlie,
    targetId: null,
  },
  {
    id: chatActionIds.bigGroup2Created,
    chatId: chatIds.bigGroup2,
    actionType: ChatActionType.CHAT_CREATED,
    actorId: profileIds.charlie,
    targetId: null,
  },
];

export const chatActionsData = rawChatActionsData.map((action) => ({
  ...action,
  createdAt:
    action.actionType === ChatActionType.CHAT_CREATED
      ? chatCreationDates[action.chatId]
      : getRandomDateBetween(chatCreationDates[action.chatId], BASE_DATE),
}));
