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

// src/services/user.ts
var user_exports = {};
__export(user_exports, {
  getUserByEmail: () => getUserByEmail,
  getUserById: () => getUserById
});
module.exports = __toCommonJS(user_exports);
var import_db = require("@db");
async function getUserByEmail(email) {
  return import_db.prisma.user.findUnique({ where: { email } });
}
async function getUserById(id) {
  return import_db.prisma.user.findUnique({ where: { id } });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getUserByEmail,
  getUserById
});
//# sourceMappingURL=user.js.map