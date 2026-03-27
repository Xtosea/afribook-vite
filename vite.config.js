import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/afribook/', // ✅ ensures all asset URLs have the correct prefix
});