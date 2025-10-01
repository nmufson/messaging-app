"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("@trpc/server/adapters/ws");
const ws_2 = require("ws");
const router_1 = require("../trpc/router");
const trpc_1 = require("../trpc");
const app_1 = require("../app");
const wss = new ws_2.WebSocketServer({ server: app_1.server });
const handler = (0, ws_1.applyWSSHandler)({
    wss,
    router: router_1.appRouter,
    createContext: trpc_1.createWSSContext,
    // Enable heartbeat messages to keep connection open (disabled by default)
    keepAlive: {
        enabled: true,
        // server ping message interval in milliseconds
        pingMs: 30000,
        // connection is terminated if pong message is not received in this many milliseconds
        pongWaitMs: 5000,
    },
});
wss.on('connection', (ws) => {
    console.log(`➕➕ Connection (${wss.clients.size})`);
    ws.once('close', () => {
        console.log(`➖➖ Connection (${wss.clients.size})`);
    });
});
console.log('✅ WebSocket Server listening on ws://localhost:3001');
process.on('SIGTERM', () => {
    console.log('SIGTERM');
    handler.broadcastReconnectNotification();
    wss.close();
});
