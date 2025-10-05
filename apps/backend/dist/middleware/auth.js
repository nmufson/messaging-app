"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/middleware/auth.ts
var import_passport = __toESM(require("passport"));
var import_passport_local = require("passport-local");

// src/services/user.ts
var import_db = require("@db");
async function getUserByEmail(email) {
  return import_db.prisma.user.findUnique({ where: { email } });
}
async function getUserById(id) {
  return import_db.prisma.user.findUnique({ where: { id } });
}

// src/services/hash.ts
var import_bcrypt = require("bcrypt");
async function verifyPassword(user, plainTextPassword) {
  const { hashedPassword } = user;
  return await (0, import_bcrypt.compare)(plainTextPassword, hashedPassword);
}

// src/middleware/auth.ts
import_passport.default.use(
  new import_passport_local.Strategy(
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
import_passport.default.serializeUser((user, done) => done(null, user.id));
import_passport.default.deserializeUser(async (id, done) => {
  const user = await getUserById(id);
  done(null, user || false);
});
//# sourceMappingURL=auth.js.map