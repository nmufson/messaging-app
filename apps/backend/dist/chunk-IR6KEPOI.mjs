import {
  verifyPassword
} from "./chunk-Q6YATOVP.mjs";
import {
  getUserByEmail,
  getUserById
} from "./chunk-Z6FCG6LY.mjs";

// src/middleware/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
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
