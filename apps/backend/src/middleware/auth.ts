import { TRPCError } from '@trpc/server';
import { t } from '../trpc';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getUserByEmail, getUserById } from '../utils/user';
import { verifyPassword } from '../utils/hash';

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      const user = await getUserByEmail(email);
      if (!user)
        return done(null, false, {
          message: 'Account with this email does not exist',
        });

      const validPassword = await verifyPassword(user, password);

      if (!validPassword)
        return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
  const user = await getUserById(id);
  done(null, user || false);
});
