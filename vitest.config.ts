import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(rootDirectory, 'src'),
    },
  },
  test: {
    // Memory bound: cap the worker count and give every worker a V8 heap ceiling, so a leaking test file fails with an OOM
    // instead of exhausting the machine.
    maxWorkers: 4,
    execArgv: ['--max-old-space-size=2048'],
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
