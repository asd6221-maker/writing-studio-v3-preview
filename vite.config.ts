import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/writing-studio-v3-preview/',
  plugins: [react()],
});
