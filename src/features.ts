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
      { to: '/navigation', title: 'Navigation', file: 'src/routes/navigation.tsx', description: '<Link>, useNavigate, active styles, preloading, redirects and navigation blocking.' },
      { to: '/route-context', title: 'Route context & beforeLoad', file: 'src/routes/route-context.tsx', description: 'Dependency injection through the route tree and running code before a route loads.' },
      { to: '/head-seo', title: 'Head & SEO', file: 'src/routes/head-seo.tsx', description: 'Per-route <title>, meta tags, links and scripts with the head() option.' },
      { to: '/css-styling', title: 'CSS & styling', file: 'src/routes/css-styling.tsx', description: 'Global stylesheets, CSS Modules and inline styles.' },
    ],
  },
  {
    title: '2. Data loading',
    items: [
      { to: '/loaders', title: 'Route loaders', file: 'src/routes/loaders.tsx', description: 'loader, loaderDeps, staleTime, pending UI and caching.' },
      { to: '/deferred-data', title: 'Deferred / streamed data', file: 'src/routes/deferred-data.tsx', description: 'Return un-awaited promises from a loader and stream them in with <Await> / use().' },
      { to: '/tanstack-query', title: 'TanStack Query', file: 'src/routes/tanstack-query.tsx', description: 'SSR + hydration of a query cache, useSuspenseQuery and mutations with invalidation.' },
      { to: '/error-handling', title: 'Errors & not found', file: 'src/routes/error-handling.tsx', description: 'errorComponent, notFound(), notFoundComponent and reset().' },
    ],
  },
  {
    title: '3. Server',
    items: [
      { to: '/server-functions', title: 'Server functions', file: 'src/routes/server-functions.tsx', description: 'createServerFn: type-safe RPCs, GET vs POST, validation, useServerFn.' },
      { to: '/forms', title: 'Forms & FormData', file: 'src/routes/forms.tsx', description: 'Posting native <form> FormData to a server function.' },
      { to: '/streaming', title: 'Streaming server functions', file: 'src/routes/streaming.tsx', description: 'Stream typed chunks with async generators and ReadableStream.' },
      { to: '/middleware', title: 'Middleware', file: 'src/routes/middleware.tsx', description: 'Request vs function middleware, context, sendContext and global middleware.' },
    ],
  },
  {
    title: '7. Auth & app shell',
    items: [
      { to: '/entry-points', title: 'Entry points & config', file: 'src/routes/entry-points.tsx', description: 'vite.config.ts, router.tsx, start.ts, server.ts, client.tsx and __root.tsx.' },
    ],
  },
] as const
