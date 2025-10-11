"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTRPCError = handleTRPCError;
const server_1 = require("@trpc/server");
const pino_1 = require("../lib/pino");
function handleTRPCError(err, fallbackMessage = 'An error occured', context // add other contextual data
) {
    if (err instanceof server_1.TRPCError) {
        throw err;
    }
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    pino_1.logger.error({
        error: errorMessage,
        stack: errorStack,
        ...context,
    }, fallbackMessage);
    throw new server_1.TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: fallbackMessage,
    });
}
//# sourceMappingURL=error.js.map