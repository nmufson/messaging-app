"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const bcrypt_1 = require("bcrypt");
const SALT_ROUNDS = 10;
async function hashPassword(plainTextPassword) {
    return await (0, bcrypt_1.hash)(plainTextPassword, SALT_ROUNDS);
}
async function verifyPassword(user, plainTextPassword) {
    const { hashedPassword } = user;
    return await (0, bcrypt_1.compare)(plainTextPassword, hashedPassword);
}
//# sourceMappingURL=hash.js.map