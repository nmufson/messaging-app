"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const auth_1 = require("../routers/auth");
const chat_1 = require("../routers/chat");
const friendRequest_1 = require("../routers/friendRequest");
const image_1 = require("../routers/image");
const message_1 = require("../routers/message");
const user_1 = require("../routers/user");
const _1 = require(".");
exports.appRouter = (0, _1.router)({
    auth: auth_1.authRouter,
    user: user_1.userRouter,
    chat: chat_1.chatRouter,
    friendRequest: friendRequest_1.friendRequestRouter,
    message: message_1.messageRouter,
    image: image_1.imageRouter,
});
