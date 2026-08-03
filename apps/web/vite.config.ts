import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { createFrontendLogWriterPlugin } from './vite-plugin-log-writer';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')) as {
  version?: string;
};
const appRelease =
  process.env.VITE_APP_RELEASE ||
  process.env.GITHUB_SHA?.slice(0, 7) ||
  `web@${pkg.version || '0.0.0'}`;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), createFrontendLogWriterPlugin()],
  // Served from CloudFront at https://<host>/admin/ (see github.com/SunnyChopper/personal-os-infra)
  base: '/admin/',
  define: {
    'import.meta.env.VITE_APP_RELEASE': JSON.stringify(appRelease),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Public source maps so client telemetry can remap minified stacks → src/*.tsx
    // before POSTing /telemetry/client-error (solo-operator tradeoff).
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('aws-amplify')) return 'vendor-amplify';
          if (id.includes('@excalidraw')) return 'vendor-excalidraw';
          if (id.includes('@xyflow')) return 'vendor-xyflow';
          if (id.includes('katex')) return 'vendor-katex';
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
        },
      },
    },
  },
  resolve: {
    alias: {
      // Path alias for src directory
      '@': resolve(__dirname, './src'),
    },
  },
});
