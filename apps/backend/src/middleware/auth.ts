import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getUserByEmail, getUserById } from '../services/user';
import { verifyPassword } from '../services/hash';
import { prisma } from '@repo/db';

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      const user = await getUserByEmail(email);

      if (!user) {
        return done(null, false, {
          message: 'Account with this email does not exist',
        });
      }

      const validPassword = await verifyPassword(user, password);

      if (!validPassword) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, {
        id: user.id,
        email: user.email,
        role: user.role,
      });
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });
  done(null, user || false);
});
