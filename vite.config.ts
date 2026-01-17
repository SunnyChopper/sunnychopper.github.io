import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { join, resolve } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Enable polyfills for Node.js built-ins
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Polyfill specific modules
      protocolImports: true,
    }),
    // Plugin to handle async_hooks import
    // This ensures all async_hooks imports (including from node_modules) resolve to our polyfill
    {
      name: 'polyfill-async-hooks',
      resolveId(id) {
        // Handle both 'async_hooks' and 'node:async_hooks' imports
        if (id === 'async_hooks' || id === 'node:async_hooks') {
          return join(process.cwd(), 'src/lib/polyfills/async-hooks.ts');
        }
        return null;
      },
    },
    // Copy CNAME file to dist after build
    {
      name: 'copy-cname',
      closeBundle() {
        try {
          copyFileSync(
            join(process.cwd(), 'public', 'CNAME'),
            join(process.cwd(), 'dist', 'CNAME')
          );
        } catch {
          console.warn('CNAME file not found or already exists');
        }
      },
    },
  ],
  base: '/', // Use root path for custom domain
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  resolve: {
    alias: {
      // Path alias for src directory
      '@': resolve(__dirname, './src'),
      // Polyfill async_hooks for LangGraph
      // Handle both 'async_hooks' and 'node:async_hooks' imports
      async_hooks: join(process.cwd(), 'src/lib/polyfills/async-hooks.ts'),
      'node:async_hooks': join(process.cwd(), 'src/lib/polyfills/async-hooks.ts'),
    },
  },
  optimizeDeps: {
    // Ensure async_hooks polyfill is properly optimized
    include: ['@langchain/langgraph/web'],
    // Exclude async_hooks from pre-bundling since we're polyfilling it
    exclude: [],
  },
});
