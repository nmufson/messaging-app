"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByEmail = getUserByEmail;
exports.getUserById = getUserById;
const _db_1 = require("@db");
async function getUserByEmail(email) {
    return _db_1.prisma.user.findUnique({ where: { email } });
}
async function getUserById(id) {
    return _db_1.prisma.user.findUnique({ where: { id } });
}
