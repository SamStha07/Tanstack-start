/**
 * VITE CONFIG — vite.config.ts
 * ----------------------------------------------------------------------------
 * TanStack Start is "just" a Vite plugin. It:
 *   - generates src/routeTree.gen.ts from src/routes (file-based routing)
 *   - compiles createServerFn / createIsomorphicFn / … into the right code
 *     for each bundle (client vs server)
 *   - builds a client bundle + a server bundle (dist/client, dist/server)
 *   - runs SSR in development
 *
 * Plugin order matters: tanstackStart() must come BEFORE viteReact().
 *
 * Docs: https://tanstack.com/start/latest/docs/framework/react/build-from-scratch
 */
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 3000 },
  // Makes the `~/*` alias from tsconfig.json work (e.g. import '~/features').
  resolve: { tsconfigPaths: true },
  plugins: [
    tanstackStart({
      // SPA mode (turns off SSR for every page). See /spa-mode.
      // spa: { enabled: true },
    }),
    viteReact(),
  ],
})
