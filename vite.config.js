import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Backend porti .env dan o'qiladi (server/index.js: process.env.PORT || 4000).
// Ilgari bu yerda 6878 qattiq yozilgan edi. Agar .env da boshqa port bo'lsa,
// dev rejimida BARCHA /api so'rovlari ishlamay qolardi.
dotenv.config({ path: path.join(__dirname, 'server', '.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const API_PORT = process.env.PORT || 7007;
const API_TARGET = process.env.VITE_API_TARGET || `http://localhost:${API_PORT}`;

console.log(`[vite] API proxy -> ${API_TARGET}`);

export default defineConfig({
  plugins: [react()],
  envDir: './src',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
      '/socket.io': {
        target: API_TARGET,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
