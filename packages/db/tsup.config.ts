import { defineConfig, type Options } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: true,
  external: ['@prisma/client', '.prisma/client'],
  splitting: false,
  sourcemap: true,
} satisfies Options);
