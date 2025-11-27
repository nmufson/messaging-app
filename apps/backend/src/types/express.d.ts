import type { User as DBUser } from '@repo/db';

declare global {
  namespace Express {
    type User = DBUser;
  }
}

export {};
