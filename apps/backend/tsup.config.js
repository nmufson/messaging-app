'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tsup_1 = require('tsup');
exports.default = (0, tsup_1.defineConfig)({
  entry: {
    app: 'src/app.ts',
    'trpc/exports': 'src/trpc/exports.ts',
  },
  dts: false,
  format: ['cjs', 'esm'],
  outDir: 'dist',
  external: ['@prisma/client', '.prisma/client', '@repo/common', '@repo/db'],
  splitting: false,
  sourcemap: true,
});
