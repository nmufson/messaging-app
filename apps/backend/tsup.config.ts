import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/app.ts'],
  dts: true,
  format: ['cjs', 'esm'],
  outDir: 'dist',
  external: ['@prisma/client', '.prisma/client'],
  splitting: false,
  sourcemap: true,
});
