/**
 * The list of every feature demo in this app — used by the sidebar and the
 * home page. Each entry points to a route file in src/routes.
 *
 * `as const` keeps each `to` as a literal string type, so TanStack Router can
 * type-check that every path really exists. Try changing one to a typo and
 * run `npm run typecheck`.
 */
export const featureSections = [
  {
    title: '1. Routing basics',
    items: [
      { to: '/routing', title: 'File-based routing', file: 'src/routes/routing.tsx', description: 'How files in src/routes become URLs, layouts and nested routes with <Outlet />.' },
      { to: '/path-params', title: 'Path params', file: 'src/routes/path-params/', description: 'Dynamic segments like /path-params/$postId, optional and splat ($) params.' },
    ],
  },
  {
    title: '7. Auth & app shell',
    items: [
      { to: '/entry-points', title: 'Entry points & config', file: 'src/routes/entry-points.tsx', description: 'vite.config.ts, router.tsx, start.ts, server.ts, client.tsx and __root.tsx.' },
    ],
  },
] as const
