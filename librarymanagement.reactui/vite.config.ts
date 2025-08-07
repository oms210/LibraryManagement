import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 3000
    },
    define: {
      __VITE_LENDING_API_URL__: JSON.stringify(env.VITE_LENDING_API_URL),
      __VITE_FINES_API_URL__: JSON.stringify(env.VITE_FINES_API_URL)
    }
  };
});
