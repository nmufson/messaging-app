// src/middleware/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

// src/services/user.ts
import { prisma } from "@db";
async function getUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}
async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

// src/services/hash.ts
import { hash, compare } from "bcrypt";
async function verifyPassword(user, plainTextPassword) {
  const { hashedPassword } = user;
  return await compare(plainTextPassword, hashedPassword);
}

// src/middleware/auth.ts
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      const user = await getUserByEmail(email);
      console.log(email, user);
      if (!user)
        return done(null, false, {
          message: "Account with this email does not exist"
        });
      const validPassword = await verifyPassword(user, password);
      console.log("Password valid:", validPassword);
      if (!validPassword)
        return done(null, false, { message: "Incorrect password" });
      return done(null, user);
    }
  )
);
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await getUserById(id);
  done(null, user || false);
});
//# sourceMappingURL=auth.mjs.map