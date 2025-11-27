import { t } from './init';
import { isAdmin, isAuthed, hasProfile } from './middleware';

export const publicProcedure = t.procedure;

export const userProcedure = t.procedure.use(isAuthed);

export const profileProcedure = t.procedure.use(hasProfile);

export const adminProcedure = t.procedure.use(isAdmin);
