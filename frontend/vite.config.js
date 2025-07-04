import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ this enables @/lib etc.
    },
  },
  server: {
    proxy: {
      '/socket.io': {
        target: 'https://instagram-clone-backend-nqcw.onrender.com',
        ws: true,
      },
      '/api': 'https://instagram-clone-backend-nqcw.onrender.com',
    },
  },
});
