"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = exports.t = void 0;
const server_1 = require("@trpc/server");
const common_1 = require("@repo/common");
exports.t = server_1.initTRPC.context().create({
    transformer: common_1.superjson,
});
exports.router = exports.t.router;
//# sourceMappingURL=init.js.map