"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = createContext;
exports.createWSSContext = createWSSContext;
const _db_1 = require("@db");
function createContext({ req, res, }) {
    return { req, res, user: req.user, prisma: _db_1.prisma };
}
function createWSSContext({ req, }) {
    return {
        req,
        user: undefined, // TODO: implement ws auth logic?
        prisma: // TODO: implement ws auth logic?
        _db_1.prisma,
    };
}
//# sourceMappingURL=context.js.map