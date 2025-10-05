import {
  prisma,
  src_exports
} from "./chunk-4QVFQIOJ.mjs";

// src/trpc/context.ts
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
