"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const prisma_session_store_1 = require("@quixo3/prisma-session-store");
const db_1 = require("@repo/db");
const cors_1 = __importDefault(require("cors"));
const express_2 = require("@trpc/server/adapters/express");
const router_1 = require("./trpc/router");
const passport_1 = __importDefault(require("passport"));
require("./middleware/auth");
const trpc_1 = require("./trpc");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: 'secret keyyy',
    resave: false,
    saveUninitialized: false,
    store: new prisma_session_store_1.PrismaSessionStore(db_1.prisma, {
        checkPeriod: 2 * 60 * 1000, //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
    }),
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// express adapter for trpc
app.use('/trpc', (0, express_2.createExpressMiddleware)({
    router: router_1.appRouter,
    createContext: trpc_1.createContext,
}));
const PORT = Number(process.env.PORT) || 3001;
exports.server = app.listen(PORT, '0.0.0.0', () => console.log(`Express app listening on port ${PORT}!`));
exports.default = app;
//# sourceMappingURL=app.js.map