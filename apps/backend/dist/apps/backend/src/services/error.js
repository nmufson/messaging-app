"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTRPCError = handleTRPCError;
const server_1 = require("@trpc/server");
function handleTRPCError(err, fallbackMessage = 'An Error occured') {
    if (err instanceof server_1.TRPCError) {
        throw err;
    }
    console.error(err); // only log if not sending err to client
    throw new server_1.TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: fallbackMessage,
    });
}
