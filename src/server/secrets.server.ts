/**
 * IMPORT PROTECTION example — src/server/secrets.server.ts
 *
 * Because the file name ends in `.server.ts`, Start refuses to let it be
 * imported into the CLIENT bundle (an error in production builds; a mocked
 * module + warning in dev). Same idea for `*.client.ts` files in the other
 * direction. Without renaming you can get the same effect with a marker
 * import at the top of a file:
 *
 *   import '@tanstack/react-start/server-only'
 *   import '@tanstack/react-start/client-only'
 *
 * Read process.env INSIDE functions, not at module level: on some runtimes
 * (e.g. Cloudflare Workers) env is only available during a request.
 */
export function getSecretApiKey() {
  return process.env.SECRET_API_KEY ?? 'sk-demo-not-set-(add SECRET_API_KEY to .env)'
}
