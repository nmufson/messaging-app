// src/trpc/init.ts
import { initTRPC } from "@trpc/server";
import { superjson } from "@common";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
export {
  router,
  t
};
//# sourceMappingURL=init.mjs.map