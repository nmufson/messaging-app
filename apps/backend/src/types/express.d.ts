import 'express';
import { UserRole } from '../../../../packages/db/src';

declare module 'express' {
  interface User {
    id: string;
    role: UserRole;
  }

  interface Request {
    user?: User;
    login: (user: User, done: (err: Error) => void) => void;
    logout: (done: (err: Error) => void) => void;
  }
}
