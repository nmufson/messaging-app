import {
  isAdmin,
  isAuthed
} from "./chunk-CKSVYPBD.mjs";
import {
  t
} from "./chunk-XI2LZ4T3.mjs";

// src/trpc/procedures.ts
var publicProcedure = t.procedure;
var userProcedure = t.procedure.use(isAuthed);
var adminProcedure = t.procedure.use(isAuthed).use(isAdmin);

export {
  publicProcedure,
  userProcedure,
  adminProcedure
};
