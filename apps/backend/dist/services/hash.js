"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/services/hash.ts
var hash_exports = {};
__export(hash_exports, {
  hashPassword: () => hashPassword,
  verifyPassword: () => verifyPassword
});
module.exports = __toCommonJS(hash_exports);
var import_bcrypt = require("bcrypt");
var SALT_ROUNDS = 10;
async function hashPassword(plainTextPassword) {
  return await (0, import_bcrypt.hash)(plainTextPassword, SALT_ROUNDS);
}
async function verifyPassword(user, plainTextPassword) {
  const { hashedPassword } = user;
  return await (0, import_bcrypt.compare)(plainTextPassword, hashedPassword);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  hashPassword,
  verifyPassword
});
//# sourceMappingURL=hash.js.map