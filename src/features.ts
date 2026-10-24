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
      { to: '/search-params', title: 'Search params', file: 'src/routes/search-params.tsx', description: 'Validated, typed URL query state with validateSearch + zod.' },
      { to: '/route-context', title: 'Route context & beforeLoad', file: 'src/routes/route-context.tsx', description: 'Dependency injection through the route tree and running code before a route loads.' },
      { to: '/head-seo', title: 'Head & SEO', file: 'src/routes/head-seo.tsx', description: 'Per-route <title>, meta tags, links and scripts with the head() option.' },
      { to: '/css-styling', title: 'CSS & styling', file: 'src/routes/css-styling.tsx', description: 'Global stylesheets, CSS Modules and inline styles.' },
    ],
  },
  {
    title: '2. Data loading',
    items: [
      { to: '/loaders', title: 'Route loaders', file: 'src/routes/loaders.tsx', description: 'loader, loaderDeps, staleTime, pending UI and caching.' },
    ],
  },
  {
    title: '7. Auth & app shell',
    items: [
      { to: '/entry-points', title: 'Entry points & config', file: 'src/routes/entry-points.tsx', description: 'vite.config.ts, router.tsx, start.ts, server.ts, client.tsx and __root.tsx.' },
    ],
  },
] as const
