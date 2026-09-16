import { defineConfig, type Options } from 'tsup';

export default defineConfig({
  entry: {
    app: 'src/app.ts',
    'trpc/exports': 'src/trpc/exports.ts',
  },
  dts: {
    compilerOptions: {
      composite: false,
    },
  },
  format: ['cjs', 'esm'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  external: ['@prisma/client', '.prisma/client', '@repo/common', '@repo/db'],
} satisfies Options);
