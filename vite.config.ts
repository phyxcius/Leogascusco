import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Rutas relativas: funciona en phyxcius.github.io/Leogascusco/ y en cualquier subcarpeta
  base: './',
  // Configuración de rutas absolutas con '@/' (opcional pero muy útil)
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000, // O el puerto que suelas usar
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
        repartidor: resolve(__dirname, 'repartidor.html'),
      },
    },
  },
});
