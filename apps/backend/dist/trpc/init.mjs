// src/trpc/init.ts
import { initTRPC } from "@trpc/server";
var t = initTRPC.context().create();
var router = t.router;
export {
  router,
  t
};
//# sourceMappingURL=init.mjs.map