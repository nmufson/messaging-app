import { t } from './init';
import { isAdmin, isAuthed } from './middleware';

export const publicProcedure = t.procedure;
export const userProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAuthed).use(isAdmin);
