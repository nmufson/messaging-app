import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['zod', 'superjson', 'luxon'],
  splitting: false,
  sourcemap: true,
});
