import {
  appRouter
} from "./chunk-AQZK2SGC.mjs";
import {
  createContext
} from "./chunk-3YSIIYAC.mjs";
import {
  prisma,
  src_exports
} from "./chunk-4QVFQIOJ.mjs";

// src/app.ts
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import passport from "passport";
dotenv.config();
var app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json());
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // ms
    },
    secret: "secret keyyy",
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1e3,
      //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: void 0
    })
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var PORT = Number(process.env.PORT) || 3001;
var server = app.listen(
  PORT,
  "0.0.0.0",
  () => console.log(`Express app listening on port ${PORT}!`)
);
var app_default = app;

export {
  server,
  app_default
};
