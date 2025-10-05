// src/trpc/context.ts
import { prisma } from "@db";
function createContext({
  req,
  res
}) {
  return { req, res, user: req.user, prisma };
}
function createWSSContext({
  req
}) {
  return {
    req,
    user: void 0,
    // TODO: implement ws auth logic?
    prisma
  };
}

export {
  createContext,
  createWSSContext
};
