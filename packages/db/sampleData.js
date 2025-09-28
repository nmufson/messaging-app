"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profilesData = exports.usersData = void 0;
var client_1 = require("@prisma/client");
var PROFILE_PIC_URL = 'https://example.com/profile-pic.png';
exports.usersData = [
    {
        email: 'alice@example.com',
        hashedPassword: 'hashedpassword1',
        role: client_1.UserRole.USER,
    },
    {
        email: 'bob@example.com',
        hashedPassword: 'hashedpassword2',
        role: client_1.UserRole.USER,
    },
    {
        email: 'charlie@example.com',
        hashedPassword: 'hashedpassword3',
        role: client_1.UserRole.USER,
    },
    {
        email: 'diana@example.com',
        hashedPassword: 'hashedpassword4',
        role: client_1.UserRole.USER,
    },
];
exports.profilesData = [
    { firstName: 'Alice', lastName: 'Smith', profilePictureUrl: PROFILE_PIC_URL },
    { firstName: 'Bob', lastName: 'Jones', profilePictureUrl: PROFILE_PIC_URL },
    { firstName: 'Charlie', lastName: 'Brown' },
    { firstName: 'Diana', lastName: 'Prince' },
];
