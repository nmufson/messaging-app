"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminProcedure = exports.userProcedure = exports.publicProcedure = void 0;
const init_1 = require("./init");
const middleware_1 = require("./middleware");
exports.publicProcedure = init_1.t.procedure;
exports.userProcedure = init_1.t.procedure.use(middleware_1.isAuthed);
exports.adminProcedure = init_1.t.procedure.use(middleware_1.isAuthed).use(middleware_1.isAdmin);
