import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * The dev server proxies the API path to the backend so the session and XSRF cookies
 * stay same-origin. Every value comes from the environment; nothing is hardcoded.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiBasePath = env.VITE_API_BASE_URL || '/api/v1';
  const notificationsBasePath = env.VITE_NOTIFICATIONS_BASE_URL || '/notifications';
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8086';
  const devPort = Number(env.VITE_DEV_SERVER_PORT) || 5173;

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') }
    },
    server: {
      host: true,
      port: devPort,
      proxy: proxyTarget && apiBasePath.startsWith('/')
        ? {
            [apiBasePath]: { target: proxyTarget, changeOrigin: true },
            // Push notifications (AdminPushNotificationController) live outside the API path.
            [notificationsBasePath]: { target: proxyTarget, changeOrigin: true },
            // Chat (ChatController STOMP endpoint) is a WebSocket on /ws, outside the API path.
            '/ws': { target: proxyTarget, changeOrigin: true, ws: true }
          }
        : undefined
    },
    build: {
      sourcemap: false,
      target: 'es2022'
    }
  };
});