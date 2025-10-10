"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const user_1 = require("../services/user");
const hash_1 = require("../services/hash");
const db_1 = require("@repo/db");
passport_1.default.use(new passport_local_1.Strategy({ usernameField: 'email' }, async (email, password, done) => {
    const user = await (0, user_1.getUserByEmail)(email);
    if (!user) {
        return done(null, false, {
            message: 'Account with this email does not exist',
        });
    }
    const validPassword = await (0, hash_1.verifyPassword)(user, password);
    if (!validPassword) {
        return done(null, false, { message: 'Incorrect password' });
    }
    return done(null, {
        id: user.id,
        email: user.email,
        role: user.role,
    });
}));
passport_1.default.serializeUser((user, done) => done(null, user.id));
passport_1.default.deserializeUser(async (id, done) => {
    const user = await db_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            role: true,
        },
    });
    done(null, user || false);
});
//# sourceMappingURL=auth.js.map