// src/lib/pino.ts
import pino from "pino";
var isDev = process.env.NODE_ENV === "development";
var logger = pino({
  level: isDev ? "debug" : "info",
  ...isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname"
      }
    }
  },
  ...process.env.NODE_ENV === "production" && {
    formatters: {
      level: (label) => ({ level: label })
    }
  }
});
export {
  logger
};
//# sourceMappingURL=pino.mjs.map