import { defineConfig } from 'vitest/config';
import path from 'node:path';

const exclude = ['**/node_modules/**', '**/dist/**', '**/.worktrees/**'];

export default defineConfig({
  test: {
    projects: [
      {
        root: __dirname,
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './apps/web/src'),
            '@shared-types': path.resolve(__dirname, './packages/shared-types/src'),
          },
        },
        test: {
          name: 'web',
          environment: 'jsdom',
          globals: true,
          include: ['apps/web/src/**/*.{test,spec}.{ts,tsx}'],
          exclude,
        },
      },
      {
        root: __dirname,
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './apps/api/src'),
            '@shared-types': path.resolve(__dirname, './packages/shared-types/src'),
          },
        },
        test: {
          name: 'api',
          environment: 'node',
          globals: true,
          include: ['apps/api/src/**/*.{test,spec}.ts'],
          exclude,
        },
      },
    ],
  },
});
