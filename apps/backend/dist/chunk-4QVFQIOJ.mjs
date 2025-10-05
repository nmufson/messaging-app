import {
  __export,
  __reExport
} from "./chunk-U5DDQYSF.mjs";

// ../../packages/db/src/index.ts
var src_exports = {};
__export(src_exports, {
  prisma: () => prisma
});
__reExport(src_exports, client_star);
import { PrismaClient } from "@prisma/client";
import * as client_star from "@prisma/client";
var prisma = new PrismaClient();

export {
  prisma,
  src_exports
};
