"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsup_1 = require("tsup");
exports.default = (0, tsup_1.defineConfig)({
    entry: {
        app: 'src/app.ts',
        'trpc/exports': 'src/trpc/exports.ts',
    },
    dts: true,
    format: ['cjs', 'esm'],
    outDir: 'dist',
    external: ['@prisma/client', '.prisma/client'],
    splitting: false,
    sourcemap: true,
});
