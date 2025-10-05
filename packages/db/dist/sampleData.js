"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesData = exports.chatsData = exports.profilesData = exports.usersData = void 0;
const client_1 = require("@prisma/client");
const PROFILE_PIC_URL = 'https://example.com/profile-pic.png';
exports.usersData = [
    {
        id: 'user-alice',
        email: 'alice@example.com',
        hashedPassword: 'hashedpassword1',
        role: client_1.UserRole.USER,
    },
    {
        id: 'user-bob',
        email: 'bob@example.com',
        hashedPassword: 'hashedpassword2',
        role: client_1.UserRole.USER,
    },
    {
        id: 'user-charlie',
        email: 'charlie@example.com',
        hashedPassword: 'hashedpassword3',
        role: client_1.UserRole.USER,
    },
    {
        id: 'user-diana',
        email: 'diana@example.com',
        hashedPassword: 'hashedpassword4',
        role: client_1.UserRole.USER,
    },
];
exports.profilesData = [
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
exports.chatsData = [
    {
        id: 'chat-alice-bob',
        creatorId: 'profile-alice',
        type: client_1.ChatType.DIRECT,
        participantIds: ['profile-alice', 'profile-bob'],
    },
    {
        id: 'chat-charlie-diana',
        creatorId: 'profile-charlie',
        type: client_1.ChatType.DIRECT,
        participantIds: ['profile-charlie', 'profile-diana'],
    },
];
exports.messagesData = [
    {
        id: 'msg-1',
        type: client_1.MessageType.TEXT,
        content: 'Hey Bob!',
        senderId: 'profile-alice',
        chatId: 'chat-alice-bob',
    },
    {
        id: 'msg-2',
        type: client_1.MessageType.TEXT,
        content: 'Hi Alice!',
        senderId: 'profile-bob',
        chatId: 'chat-alice-bob',
    },
    {
        id: 'msg-3',
        type: client_1.MessageType.TEXT,
        content: 'Hello Diana!',
        senderId: 'profile-charlie',
        chatId: 'chat-charlie-diana',
    },
];
