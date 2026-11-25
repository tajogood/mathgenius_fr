import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],test:{environment:'jsdom',include:['scripts/i18n/*.test.tsx'],setupFiles:['scripts/i18n/setup-en.ts'],testTimeout:600000}});
