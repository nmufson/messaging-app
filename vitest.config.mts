import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\/(.*)$/,
        replacement: `${path.resolve(rootDir, 'apps/backend/src')}/$1`,
      },
      {
        find: /^@repo\/common$/,
        replacement: path.resolve(rootDir, 'packages/common/src/index.ts'),
      },
      {
        find: /^@repo\/common\/(.*)$/,
        replacement: `${path.resolve(rootDir, 'packages/common/src')}/$1`,
      },
      {
        find: /^@repo\/db$/,
        replacement: path.resolve(rootDir, 'packages/db/src/index.ts'),
      },
      {
        find: /^@repo\/db\/(.*)$/,
        replacement: `${path.resolve(rootDir, 'packages/db/src')}/$1`,
      },
    ],
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'packages/common/src/**/*.test.ts',
      'apps/backend/src/**/*.test.ts',
    ],
    threads: false,
  },
});
