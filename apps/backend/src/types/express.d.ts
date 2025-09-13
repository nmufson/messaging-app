import 'express';

declare module 'express' {
  interface User {
    id: string;
    email: string;
  }

  interface Request {
    user?: User;
    login: (user: User, done: (err: Error) => void) => void;
    logout: (done: (err: Error) => void) => void;
  }
}
