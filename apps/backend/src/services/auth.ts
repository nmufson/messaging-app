import { User } from '@repo/db';
import { TRPCError } from '@trpc/server';
import type { Request } from 'express';

export function loginUser(props: {
  req: Request;
  user: User;
}): Promise<{ user: User }> {
  const { req, user } = props;

  return new Promise((resolve, reject) => {
    req.login(user, (err: Error) => {
      if (err) {
        console.error('Failed to login user:', err);
        return reject(
          new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to login',
          })
        );
      }
      resolve({ user });
    });
  });
}
