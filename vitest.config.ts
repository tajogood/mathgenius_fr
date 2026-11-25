import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    testTimeout: 15000, // complex interactive SVG tests may exceed 5s on shared CI runners
    include: ['tests/**/*.test.tsx'],
    setupFiles: ['tests/setup-lang.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
});
