import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.spec.ts'],
    environment: 'node',
    setupFiles: ['tests/unit/vitest-setup.ts'],
  },
  resolve: {
    alias: {
      '@game': join(__dirname, 'assets', 'scripts'),
      'cc': join(__dirname, 'tests', 'unit', 'mocks', 'cc.ts'),
    },
  },
});
