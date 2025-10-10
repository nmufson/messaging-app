import { defineConfig } from 'tsup';

export default defineConfig({
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
